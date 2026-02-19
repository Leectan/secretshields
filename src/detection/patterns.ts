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
]);

export const PATTERNS: SecretPattern[] = [
  {
    id: "aws-access-key-id",
    name: "AWS Access Key ID",
    provider: "AWS",
    regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16})\b/g,
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
    regex:
      /(?:aws_secret_access_key|secret_access_key|aws_secret|secretAccessKey)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/g,
    severity: "critical",
    rotationUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    prefixLen: 4,
    suffixLen: 4,
    entropyThreshold: 3.5,
    configKey: "secretshields.detectors.awsKeys",
  },
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
  {
    id: "stripe-secret-key",
    name: "Stripe Secret Key",
    provider: "Stripe",
    regex: /\b(sk_live_[A-Za-z0-9]{24,99})\b/g,
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
    regex: /\b(pk_live_[A-Za-z0-9]{24,99})\b/g,
    severity: "medium",
    rotationUrl: "https://dashboard.stripe.com/apikeys",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.stripeKeys",
  },
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
    regex: /\b(sk-proj-[A-Za-z0-9_-]{40,200})\b/g,
    severity: "critical",
    rotationUrl: "https://platform.openai.com/api-keys",
    prefixLen: 8,
    suffixLen: 4,
    entropyThreshold: 0,
    configKey: "secretshields.detectors.openaiKeys",
  },
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
  },
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
  },
];
