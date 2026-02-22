import { describe, it, expect } from "vitest";
import { PATTERNS, ALLOWLIST } from "../../src/detection/patterns";
import { detectSecrets } from "../../src/detection/engine";
import { TRUE_POSITIVES, FALSE_POSITIVES } from "../fixtures/secrets";

/** Helper: find a pattern by ID and test it against input. */
function expectMatch(patternId: string, input: string) {
  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  expect(pattern, `Pattern "${patternId}" not found`).toBeDefined();
  pattern.regex.lastIndex = 0;
  const match = pattern.regex.exec(input);
  expect(match, `Pattern "${patternId}" should match`).not.toBeNull();
}

function expectNoMatch(patternId: string, input: string) {
  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  expect(pattern, `Pattern "${patternId}" not found`).toBeDefined();
  pattern.regex.lastIndex = 0;
  const match = pattern.regex.exec(input);
  expect(match, `Pattern "${patternId}" should NOT match`).toBeNull();
}

// ────────────────── Original patterns (true positives) ──────────────────

describe("patterns - true positives (original)", () => {
  it("detects AWS access key ID", () => {
    expectMatch("aws-access-key-id", TRUE_POSITIVES.awsAccessKeyId);
  });

  it("detects AWS secret access key", () => {
    expectMatch("aws-secret-access-key", TRUE_POSITIVES.awsSecretAccessKey);
  });

  it("detects GitHub PAT (ghp_)", () => {
    expectMatch("github-token", TRUE_POSITIVES.githubPat);
  });

  it("detects GitHub fine-grained PAT", () => {
    expectMatch("github-token", TRUE_POSITIVES.githubFineGrained);
  });

  it("detects Stripe live secret key", () => {
    expectMatch("stripe-secret-key", TRUE_POSITIVES.stripeLiveSecret);
  });

  it("detects Stripe test secret key", () => {
    expectMatch("stripe-secret-key", TRUE_POSITIVES.stripeTestSecret);
  });

  it("detects Stripe restricted key", () => {
    expectMatch("stripe-secret-key", TRUE_POSITIVES.stripeRestrictedKey);
  });

  it("detects Stripe live publishable key", () => {
    expectMatch("stripe-publishable-key", TRUE_POSITIVES.stripeLivePublishable);
  });

  it("detects Stripe test publishable key", () => {
    expectMatch("stripe-publishable-key", TRUE_POSITIVES.stripeTestPublishable);
  });

  it("detects Stripe webhook signing secret", () => {
    expectMatch("stripe-webhook-secret", TRUE_POSITIVES.stripeWebhookSecret);
  });

  it("detects OpenAI API key (v1 format)", () => {
    expectMatch("openai-api-key", TRUE_POSITIVES.openaiKeyV1);
  });

  it("detects OpenAI API key (v2/project format)", () => {
    expectMatch("openai-api-key-v2", TRUE_POSITIVES.openaiKeyV2);
  });

  it("detects Anthropic API key", () => {
    expectMatch("anthropic-api-key", TRUE_POSITIVES.anthropicKey);
  });

  it("detects Google API key", () => {
    expectMatch("google-api-key", TRUE_POSITIVES.googleApiKey);
  });

  it("detects PostgreSQL URL with password", () => {
    expectMatch("database-url", TRUE_POSITIVES.databaseUrl);
  });

  it("detects MongoDB+SRV URL with password", () => {
    expectMatch("database-url", TRUE_POSITIVES.mongoUrl);
  });

  it("detects SSH private key", () => {
    expectMatch("ssh-private-key", TRUE_POSITIVES.sshPrivateKey);
  });

  it("detects JWT", () => {
    expectMatch("jwt", TRUE_POSITIVES.jwt);
  });
});

// ────────────────── New patterns (true positives) ──────────────────

describe("patterns - true positives (new platforms)", () => {
  it("detects Vercel PAT (vcp_)", () => {
    expectMatch("vercel-token", TRUE_POSITIVES.vercelPat);
  });

  it("detects Vercel Blob token", () => {
    expectMatch("vercel-blob-token", TRUE_POSITIVES.vercelBlobToken);
  });

  it("detects Slack bot token (xoxb-)", () => {
    expectMatch("slack-token", TRUE_POSITIVES.slackBotToken);
  });

  it("detects Slack app token (xapp-)", () => {
    expectMatch("slack-token", TRUE_POSITIVES.slackAppToken);
  });

  it("detects Slack webhook URL", () => {
    expectMatch("slack-webhook-url", TRUE_POSITIVES.slackWebhookUrl);
  });

  it("detects SendGrid API key (SG.)", () => {
    expectMatch("sendgrid-api-key", TRUE_POSITIVES.sendgridKey);
  });

  it("detects Shopify access token (shpat_)", () => {
    expectMatch("shopify-token", TRUE_POSITIVES.shopifyToken);
  });

  it("detects Twilio Account SID with context keyword (AC)", () => {
    expectMatch("twilio-account-sid", TRUE_POSITIVES.twilioAccountSid);
  });

  it("detects Twilio API Key SID (SK)", () => {
    expectMatch("twilio-api-key-sid", TRUE_POSITIVES.twilioApiKeySid);
  });

  it("detects DigitalOcean PAT (dop_v1_)", () => {
    expectMatch("digitalocean-token", TRUE_POSITIVES.digitaloceanPat);
  });

  it("detects npm access token (npm_)", () => {
    expectMatch("npm-token", TRUE_POSITIVES.npmToken);
  });

  it("detects PyPI upload token (pypi-)", () => {
    expectMatch("pypi-token", TRUE_POSITIVES.pypiToken);
  });

  it("detects HashiCorp Vault token (hvs.)", () => {
    expectMatch("hashicorp-vault-token", TRUE_POSITIVES.vaultToken);
  });

  it("detects Doppler token (dp.pt.)", () => {
    expectMatch("doppler-token", TRUE_POSITIVES.dopplerToken);
  });

  it("detects Linear API key (lin_api_)", () => {
    expectMatch("linear-api-key", TRUE_POSITIVES.linearApiKey);
  });

  it("detects Grafana service account token (glsa_)", () => {
    expectMatch("grafana-service-token", TRUE_POSITIVES.grafanaToken);
  });

  it("detects New Relic API key (NRAK-)", () => {
    expectMatch("newrelic-key", TRUE_POSITIVES.newrelicKey);
  });

  it("detects Heroku OAuth token (HRKU-)", () => {
    expectMatch("heroku-token", TRUE_POSITIVES.herokuToken);
  });

  it("detects PlanetScale token (pscale_tkn_)", () => {
    expectMatch("planetscale-token", TRUE_POSITIVES.planetscaleToken);
  });

  it("detects Docker Hub PAT (dckr_pat_)", () => {
    expectMatch("docker-pat", TRUE_POSITIVES.dockerPat);
  });

  it("detects Resend API key (re_)", () => {
    expectMatch("resend-api-key", TRUE_POSITIVES.resendKey);
  });

  it("detects Supabase secret key (sb_secret_)", () => {
    expectMatch("supabase-key", TRUE_POSITIVES.supabaseKey);
  });

  it("detects Netlify token (nfp_)", () => {
    expectMatch("netlify-token", TRUE_POSITIVES.netlifyToken);
  });

  it("detects Appwrite standard API key", () => {
    expectMatch("appwrite-api-key", TRUE_POSITIVES.appwriteKey);
  });

  it("detects Cloudflare Origin CA key (v1.0-)", () => {
    expectMatch("cloudflare-origin-ca-key", TRUE_POSITIVES.cloudflareOriginCaKey);
  });

  it("detects Discord webhook URL", () => {
    expectMatch("discord-webhook-url", TRUE_POSITIVES.discordWebhookUrl);
  });
});

// ────────────────── False positives ──────────────────

describe("patterns - false positives (should NOT match or should be filtered)", () => {
  it("allowlists AWS example key", () => {
    expect(ALLOWLIST.has(FALSE_POSITIVES.awsExampleKey)).toBe(true);
  });

  it("allowlists Stripe test key example from docs", () => {
    expect(ALLOWLIST.has(FALSE_POSITIVES.stripeTestKey)).toBe(true);
  });

  it("does not match Stripe key with body too short", () => {
    expectNoMatch("stripe-secret-key", FALSE_POSITIVES.stripeShortBody);
  });

  it("does not match DB URL without password", () => {
    expectNoMatch("database-url", FALSE_POSITIVES.dbUrlNoPassword);
  });

  it("does not match generic config values", () => {
    let matched = false;
    for (const p of PATTERNS) {
      p.regex.lastIndex = 0;
      if (p.regex.exec(FALSE_POSITIVES.configValue)) {
        matched = true;
        break;
      }
    }
    expect(matched).toBe(false);
  });

  it("allowlists Twilio example SID", () => {
    expect(ALLOWLIST.has(FALSE_POSITIVES.twilioExampleSid)).toBe(true);
  });

  it("allowlists Slack example token", () => {
    expect(ALLOWLIST.has("xoxb-not-a-real-token-this-will-not-work")).toBe(true);
  });

  // ── Regex-level false positive tests ──

  it("does not match bare Twilio AC SID without context keyword", () => {
    expectNoMatch("twilio-account-sid", FALSE_POSITIVES.twilioBareSid);
  });

  it("does not match Resend-like variable name with underscores", () => {
    expectNoMatch("resend-api-key", FALSE_POSITIVES.resendLikeVariable);
  });

  it("does not match short Slack token body (< 20 chars)", () => {
    expectNoMatch("slack-token", FALSE_POSITIVES.slackShortBody);
  });

  it("does not match short OpenAI v2 key body (< 80 chars)", () => {
    expectNoMatch("openai-api-key-v2", "sk-proj-" + "a".repeat(40));
  });
});

// ────────────────── Validate-level false positives (engine integration) ──────────────────

describe("patterns - validate-level false positives (via detectSecrets)", () => {
  it("skips DB URL with placeholder password", () => {
    const results = detectSecrets(FALSE_POSITIVES.dbUrlPlaceholderPassword);
    expect(results).toHaveLength(0);
  });

  it("skips DB URL with template variable password", () => {
    const results = detectSecrets(FALSE_POSITIVES.dbUrlTemplatePassword);
    expect(results).toHaveLength(0);
  });

  it("skips JWT-like string without valid alg header", () => {
    const results = detectSecrets(FALSE_POSITIVES.jwtNoAlg);
    expect(results).toHaveLength(0);
  });

  it("still detects DB URL with real password", () => {
    const results = detectSecrets(TRUE_POSITIVES.databaseUrl);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].provider).toBe("Database");
  });

  it("still detects valid JWT", () => {
    const results = detectSecrets(TRUE_POSITIVES.jwt);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].provider).toBe("JWT");
  });
});
