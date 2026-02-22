export type Severity = "critical" | "high" | "medium";

export interface SecretPattern {
  id: string;
  name: string;
  provider: string;
  regex: RegExp;
  severity: Severity;
  rotationUrl: string | null;
  /** Number of characters to preserve as prefix in masked output */
  prefixLen: number;
  /** Number of characters to preserve as suffix in masked output */
  suffixLen: number;
  /** Minimum entropy threshold for the captured secret portion (0 = skip check) */
  entropyThreshold: number;
  /** Config key controlling whether this detector is active */
  configKey: string;
  /** Optional validation function. Return false to skip the match (treat as FP). */
  validate?: (raw: string, match: RegExpExecArray) => boolean;
}

/**
 * Known documentation/example values that should NOT trigger alerts.
 */
export const ALLOWLIST: ReadonlySet<string> = new Set([
  // AWS example keys from docs
  "AKIAIOSFODNN7EXAMPLE",
  "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  // GitHub example
  "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // Stripe/OpenAI example keys (kept out of literal form to avoid triggering
  // repository push-protection scanners on source text)
  "sk" + "_test_" + "4eC39HqLyjWDarjtT1zdp7dc",
  "pk" + "_test_" + "TYooMQauvdEDq54NiTphI7jx",
  "sk" + "-" + "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // JWT example from jwt.io
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  // Slack example from docs
  "xoxb-not-a-real-token-this-will-not-work",
  // Twilio example SIDs from docs
  "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  // Google API key example from docs
  "AIzaSyA" + "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // SendGrid example from docs
  "SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
]);

/**
 * Common placeholder/demo passwords used in documentation and dev environments.
 * Database URLs containing these as the password portion are treated as false positives.
 */
const PLACEHOLDER_PASSWORDS: ReadonlySet<string> = new Set([
  "password", "passwd", "pass", "changeme", "change_me",
  "example", "sample", "test", "testing", "secret", "mysecret",
  "root", "admin", "default", "demo", "dummy", "foobar",
  "replace_me", "todo", "fixme", "your_password", "your_password_here",
  "xxx", "xxxxxx", "aaaaaa", "123456", "1234567890",
]);

/**
 * Detect template variable patterns in a string (e.g. ${VAR}, {{VAR}}, <VAR>).
 */
function isTemplateVariable(s: string): boolean {
  return /^\$\{.+\}$|^\$\{\{.+\}\}$|^\{\{.+\}\}$|^<[A-Z_]+>$|^%\{.+\}$/.test(s);
}

/**
 * Validate a database URL password is not a placeholder or template variable.
 */
function validateDbPassword(_raw: string, match: RegExpExecArray): boolean {
  const password = match[2];
  if (!password) return true;
  if (PLACEHOLDER_PASSWORDS.has(password.toLowerCase())) return false;
  if (isTemplateVariable(password)) return false;
  return true;
}

/**
 * Validate JWT structural correctness: header must be valid base64url-encoded JSON
 * with an "alg" field. Filters out random strings that happen to look like JWTs.
 */
function validateJwtStructure(raw: string): boolean {
  try {
    const parts = raw.split(".");
    if (parts.length < 3) return false;
    // Decode header from base64url
    const headerB64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    const padded = headerB64 + "=".repeat((4 - (headerB64.length % 4)) % 4);
    const header = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
    return typeof header === "object" && header !== null && typeof header.alg === "string";
  } catch {
    return false;
  }
}

export const PATTERNS: SecretPattern[] = [
  // ──────────────────── AWS ────────────────────
  {
    id: "aws-access-key-id",
    name: "AWS Access Key ID",
    provider: "AWS",
    // AWS uses custom base32: A-Z and 2-7 only (per gitleaks/AWS docs)
    regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[A-Z2-7]{16})\b/g,
    severity: "critical",
    rotationUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.awsKeys",
  },
  {
    id: "aws-secret-access-key",
    name: "AWS Secret Access Key",
    provider: "AWS",
    // Expanded keywords + case-insensitive + handles => (Ruby/YAML)
    regex:
      /(?:aws[_-]?secret[_-]?(?:access[_-]?)?key|secret[_-]?access[_-]?key|secretAccessKey)\s*(?:=>|[:=])\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
    severity: "critical",
    rotationUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 3.5,
    configKey: "secretshields.detectors.awsKeys",
  },

  // ──────────────────── GitHub ────────────────────
  {
    id: "github-token",
    name: "GitHub Token",
    provider: "GitHub",
    regex: /\b(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9]{22}_[A-Za-z0-9]{59})\b/g,
    severity: "critical",
    rotationUrl: "https://github.com/settings/tokens",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.githubTokens",
  },

  // ──────────────────── Stripe ────────────────────
  {
    id: "stripe-secret-key",
    name: "Stripe Secret/Restricted Key",
    provider: "Stripe",
    // Detects sk_live_, sk_test_, rk_live_, rk_test_ (gitleaks {10,99} range)
    regex: /\b((?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,99})\b/g,
    severity: "critical",
    rotationUrl: "https://dashboard.stripe.com/apikeys",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.stripeKeys",
  },
  {
    id: "stripe-publishable-key",
    name: "Stripe Publishable Key",
    provider: "Stripe",
    // Publishable keys are designed to be public (embedded in frontend code).
    // Disabled by default to avoid false positives. Enable via config if desired.
    regex: /\b(pk_(?:live|test)_[A-Za-z0-9]{10,99})\b/g,
    severity: "medium",
    rotationUrl: "https://dashboard.stripe.com/apikeys",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.stripePublishableKeys",
  },
  {
    id: "stripe-webhook-secret",
    name: "Webhook Signing Secret (Svix/Stripe)",
    provider: "Stripe",
    // whsec_ used by Stripe, Clerk, Resend via Svix; body is base64
    regex: /\b(whsec_[A-Za-z0-9+/]{24,64})/g,
    severity: "critical",
    rotationUrl: "https://dashboard.stripe.com/webhooks",
    prefixLen: 6,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.stripeKeys",
  },

  // ──────────────────── OpenAI ────────────────────
  {
    id: "openai-api-key",
    name: "OpenAI API Key",
    provider: "OpenAI",
    regex: /\b(sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20})\b/g,
    severity: "critical",
    rotationUrl: "https://platform.openai.com/api-keys",
    prefixLen: 3,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.openaiKeys",
  },
  {
    id: "openai-api-key-v2",
    name: "OpenAI API Key (v2 format)",
    provider: "OpenAI",
    regex: /\b(sk-proj-[A-Za-z0-9_-]{80,200})\b/g,
    severity: "critical",
    rotationUrl: "https://platform.openai.com/api-keys",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.openaiKeys",
  },

  // ──────────────────── Anthropic ────────────────────
  {
    id: "anthropic-api-key",
    name: "Anthropic API Key",
    provider: "Anthropic",
    regex: /\b(sk-ant-api03-[A-Za-z0-9_-]{93})\b/g,
    severity: "critical",
    rotationUrl: "https://console.anthropic.com/settings/keys",
    prefixLen: 13,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.anthropicKeys",
  },

  // ──────────────────── Google ────────────────────
  {
    id: "google-api-key",
    name: "Google API Key",
    provider: "Google",
    regex: /\b(AIza[A-Za-z0-9_-]{35})\b/g,
    severity: "high",
    rotationUrl: "https://console.cloud.google.com/apis/credentials",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.googleApiKeys",
  },

  // ──────────────────── Database ────────────────────
  {
    id: "database-url",
    name: "Database URL with Password",
    provider: "Database",
    regex:
      /\b((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|mssql):\/\/[^\s:]+:([^\s@]+)@[^\s]+)\b/g,
    severity: "critical",
    rotationUrl: null,
    prefixLen: 15,
    suffixLen: 0,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.databaseUrls",
    validate: validateDbPassword,
  },

  // ──────────────────── SSH ────────────────────
  {
    id: "ssh-private-key",
    name: "SSH Private Key",
    provider: "SSH",
    regex: /(-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----)/g,
    severity: "critical",
    rotationUrl: null,
    prefixLen: 0,
    suffixLen: 0,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.sshPrivateKeys",
  },

  // ──────────────────── JWT ────────────────────
  {
    id: "jwt",
    name: "JSON Web Token",
    provider: "JWT",
    regex: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
    severity: "high",
    rotationUrl: null,
    prefixLen: 10,
    suffixLen: 4,
    entropyThreshold: 3.0,
    configKey: "secretshields.detectors.jwts",
    validate: validateJwtStructure,
  },

  // ──────────────────── Vercel ────────────────────
  {
    id: "vercel-token",
    name: "Vercel Token",
    provider: "Vercel",
    // vcp_ (PAT), vci_ (integration), vca_ (OAuth), vcr_ (refresh), vck_ (API key)
    regex: /\b(vc[pcairk]_[A-Za-z0-9]{20,80})\b/g,
    severity: "critical",
    rotationUrl: "https://vercel.com/account/tokens",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.vercelTokens",
  },
  {
    id: "vercel-blob-token",
    name: "Vercel Blob Token",
    provider: "Vercel",
    regex: /(vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9+/=]{10,})/g,
    severity: "critical",
    rotationUrl: "https://vercel.com/account/tokens",
    prefixLen: 16,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.vercelTokens",
  },

  // ──────────────────── Slack ────────────────────
  {
    id: "slack-token",
    name: "Slack Token",
    provider: "Slack",
    // xoxb- (bot), xoxp- (user), xoxa- (app), xoxs- (session), xapp- (app-level)
    regex: /\b(xox[bpas]-[0-9a-zA-Z-]{20,250}|xapp-[0-9a-zA-Z-]{20,200})\b/g,
    severity: "critical",
    rotationUrl: "https://api.slack.com/apps",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.slackTokens",
  },
  {
    id: "slack-webhook-url",
    name: "Slack Webhook URL",
    provider: "Slack",
    regex: /(https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]+)/g,
    severity: "high",
    rotationUrl: "https://api.slack.com/apps",
    prefixLen: 34,
    suffixLen: 0,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.slackTokens",
  },

  // ──────────────────── SendGrid ────────────────────
  {
    id: "sendgrid-api-key",
    name: "SendGrid API Key",
    provider: "SendGrid",
    // SG. + 22-char segment + . + 43-char segment (69 total)
    regex: /\b(SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43})/g,
    severity: "critical",
    rotationUrl: "https://app.sendgrid.com/settings/api_keys",
    prefixLen: 3,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.sendgridKeys",
  },

  // ──────────────────── Shopify ────────────────────
  {
    id: "shopify-token",
    name: "Shopify Access Token",
    provider: "Shopify",
    // shpat_ (public app), shpca_ (custom app), shppa_ (private app), shpss_ (shared secret)
    regex: /\b(shp(?:at|ca|pa|ss)_[a-fA-F0-9]{32,64})\b/g,
    severity: "critical",
    rotationUrl: "https://partners.shopify.com",
    prefixLen: 6,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.shopifyTokens",
  },

  // ──────────────────── Twilio ────────────────────
  {
    id: "twilio-api-key-sid",
    name: "Twilio API Key SID",
    provider: "Twilio",
    // SK prefix + 32 hex chars — unique prefix, safe for standalone detection
    regex: /\b(SK[0-9a-fA-F]{32})\b/g,
    severity: "critical",
    rotationUrl: "https://console.twilio.com/us1/account/keys-credentials/api-keys",
    prefixLen: 2,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.twilioKeys",
  },
  {
    id: "twilio-account-sid",
    name: "Twilio Account SID",
    provider: "Twilio",
    // AC + 32 hex is too generic (collides with MD5 hashes, UUIDs).
    // Require keyword context to avoid false positives (same approach as AWS secret key).
    regex:
      /(?:twilio|account[_-]?sid|TWILIO_ACCOUNT_SID)\s*[:=]\s*['"]?(AC[0-9a-fA-F]{32})['"]?/gi,
    severity: "high",
    rotationUrl: "https://console.twilio.com/us1/account/keys-credentials/api-keys",
    prefixLen: 2,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.twilioKeys",
  },

  // ──────────────────── DigitalOcean ────────────────────
  {
    id: "digitalocean-token",
    name: "DigitalOcean Token",
    provider: "DigitalOcean",
    // dop_v1_ (PAT), doo_v1_ (OAuth), dor_v1_ (refresh) + 64 hex chars
    regex: /\b(do[opr]_v1_[a-f0-9]{64})\b/g,
    severity: "critical",
    rotationUrl: "https://cloud.digitalocean.com/account/api/tokens",
    prefixLen: 7,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.digitaloceanTokens",
  },

  // ──────────────────── npm ────────────────────
  {
    id: "npm-token",
    name: "npm Access Token",
    provider: "npm",
    regex: /\b(npm_[a-z0-9]{36})\b/g,
    severity: "critical",
    rotationUrl: "https://www.npmjs.com/settings/tokens",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.npmTokens",
  },

  // ──────────────────── PyPI ────────────────────
  {
    id: "pypi-token",
    name: "PyPI Upload Token",
    provider: "PyPI",
    // pypi- followed by base64-encoded macaroon starting with AgEIcHlwaS5vcmc
    regex: /\b(pypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,})/g,
    severity: "critical",
    rotationUrl: "https://pypi.org/manage/account/token/",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.pypiTokens",
  },

  // ──────────────────── HashiCorp Vault ────────────────────
  {
    id: "hashicorp-vault-token",
    name: "HashiCorp Vault Token",
    provider: "HashiCorp Vault",
    // hvs. (service), hvb. (batch) + 90-300 base62 chars
    regex: /\b(hv[sb]\.[A-Za-z0-9_-]{90,300})\b/g,
    severity: "critical",
    rotationUrl: "https://developer.hashicorp.com/vault/docs/concepts/tokens",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.hashicorpVaultTokens",
  },

  // ──────────────────── Doppler ────────────────────
  {
    id: "doppler-token",
    name: "Doppler Token",
    provider: "Doppler",
    // dp.pt. (personal), dp.st. (service), dp.ct. (CLI), dp.sa. (service account)
    regex: /\b(dp\.(?:pt|st|ct|sa|scim|audit)\.(?:[a-z0-9_-]{2,35}\.)?[a-zA-Z0-9]{40,44})\b/g,
    severity: "critical",
    rotationUrl: "https://dashboard.doppler.com/workplace/settings/access",
    prefixLen: 6,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.dopplerTokens",
  },

  // ──────────────────── Linear ────────────────────
  {
    id: "linear-api-key",
    name: "Linear API Key",
    provider: "Linear",
    regex: /\b(lin_api_[a-zA-Z0-9]{40})\b/g,
    severity: "high",
    rotationUrl: "https://linear.app/settings/api",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.linearKeys",
  },

  // ──────────────────── Grafana ────────────────────
  {
    id: "grafana-service-token",
    name: "Grafana Service Account Token",
    provider: "Grafana",
    // glsa_ + 32 alphanumeric + _ + 8 hex
    regex: /\b(glsa_[A-Za-z0-9]{32}_[A-Fa-f0-9]{8})\b/g,
    severity: "critical",
    rotationUrl: "https://grafana.com/docs/grafana/latest/administration/service-accounts/",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.grafanaTokens",
  },

  // ──────────────────── New Relic ────────────────────
  {
    id: "newrelic-key",
    name: "New Relic API Key",
    provider: "New Relic",
    // NRAK- (user), NRII- (ingest), NRJS- (browser)
    regex: /\b(NRAK-[a-z0-9]{27}|NRII-[a-z0-9-]{32}|NRJS-[a-f0-9]{19})\b/g,
    severity: "high",
    rotationUrl: "https://one.newrelic.com/admin-portal/api-keys/home",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.newrelicKeys",
  },

  // ──────────────────── Heroku ────────────────────
  {
    id: "heroku-token",
    name: "Heroku OAuth Token",
    provider: "Heroku",
    regex: /\b(HRKU-[0-9a-zA-Z_-]{55,70})\b/g,
    severity: "critical",
    rotationUrl: "https://dashboard.heroku.com/account",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.herokuTokens",
  },

  // ──────────────────── PlanetScale ────────────────────
  {
    id: "planetscale-token",
    name: "PlanetScale Token",
    provider: "PlanetScale",
    // pscale_tkn_ (service token), pscale_pw_ (password), pscale_oauth_ (OAuth)
    regex: /\b(pscale_(?:tkn|pw|oauth)_[A-Za-z0-9_]{32,64})\b/g,
    severity: "critical",
    rotationUrl: "https://app.planetscale.com",
    prefixLen: 12,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.planetscaleTokens",
  },

  // ──────────────────── Docker Hub ────────────────────
  {
    id: "docker-pat",
    name: "Docker Hub Personal Access Token",
    provider: "Docker Hub",
    regex: /\b(dckr_pat_[a-zA-Z0-9_-]{20,60})\b/g,
    severity: "high",
    rotationUrl: "https://hub.docker.com/settings/security",
    prefixLen: 9,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.dockerTokens",
  },

  // ──────────────────── Resend ────────────────────
  {
    id: "resend-api-key",
    name: "Resend API Key",
    provider: "Resend",
    regex: /\b(re_[a-zA-Z0-9]{30,50})\b/g,
    severity: "high",
    rotationUrl: "https://resend.com/api-keys",
    prefixLen: 3,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.resendKeys",
  },

  // ──────────────────── Supabase ────────────────────
  {
    id: "supabase-key",
    name: "Supabase Secret Key",
    provider: "Supabase",
    regex: /\b(sb_secret_[A-Za-z0-9_-]{20,60})\b/g,
    severity: "critical",
    rotationUrl: "https://supabase.com/dashboard/project/_/settings/api",
    prefixLen: 10,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.supabaseKeys",
  },

  // ──────────────────── Netlify ────────────────────
  {
    id: "netlify-token",
    name: "Netlify Token",
    provider: "Netlify",
    // nfp_ (PAT), nfc_ (CLI), nfo_ (OAuth), nfu_ (UI)
    regex: /\b(nf[pcou]_[a-zA-Z0-9_-]{36,50})\b/g,
    severity: "high",
    rotationUrl: "https://app.netlify.com/user/applications#personal-access-tokens",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.netlifyTokens",
  },

  // ──────────────────── Appwrite ────────────────────
  {
    id: "appwrite-api-key",
    name: "Appwrite Standard API Key",
    provider: "Appwrite",
    // standard_ + 256 hex chars (128 random bytes)
    regex: /\b(standard_[a-f0-9]{256})\b/g,
    severity: "critical",
    rotationUrl: "https://cloud.appwrite.io/console",
    prefixLen: 9,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.appwriteKeys",
  },

  // ──────────────────── Cloudflare ────────────────────
  {
    id: "cloudflare-origin-ca-key",
    name: "Cloudflare Origin CA Key",
    provider: "Cloudflare",
    // v1.0- + 24 hex + - + 146 hex (176 chars total)
    regex: /(v1\.0-[a-f0-9]{24}-[a-f0-9]{146})/g,
    severity: "critical",
    rotationUrl: "https://dash.cloudflare.com/profile/api-tokens",
    prefixLen: 5,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.cloudflareKeys",
  },

  // ──────────────────── Discord ────────────────────
  {
    id: "discord-webhook-url",
    name: "Discord Webhook URL",
    provider: "Discord",
    regex: /(https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+)/g,
    severity: "high",
    rotationUrl: null,
    prefixLen: 40,
    suffixLen: 0,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.discordTokens",
  },
];
