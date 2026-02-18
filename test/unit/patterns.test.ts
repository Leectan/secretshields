import { describe, it, expect } from "vitest";
import { PATTERNS, ALLOWLIST } from "../../src/detection/patterns";
import { TRUE_POSITIVES, FALSE_POSITIVES } from "../fixtures/secrets";

describe("patterns - true positives", () => {
  it("detects AWS access key ID", () => {
    const pattern = PATTERNS.find((p) => p.id === "aws-access-key-id")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.awsAccessKeyId);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("AKIAIOSFODNN7EXAMPL1");
  });

  it("detects AWS secret access key", () => {
    const pattern = PATTERNS.find((p) => p.id === "aws-secret-access-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.awsSecretAccessKey);
    expect(match).not.toBeNull();
  });

  it("detects GitHub PAT (ghp_)", () => {
    const pattern = PATTERNS.find((p) => p.id === "github-token")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.githubPat);
    expect(match).not.toBeNull();
  });

  it("detects GitHub fine-grained PAT", () => {
    const pattern = PATTERNS.find((p) => p.id === "github-token")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.githubFineGrained);
    expect(match).not.toBeNull();
  });

  it("detects Stripe live secret key", () => {
    const pattern = PATTERNS.find((p) => p.id === "stripe-secret-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.stripeLiveSecret);
    expect(match).not.toBeNull();
  });

  it("detects Stripe live publishable key", () => {
    const pattern = PATTERNS.find((p) => p.id === "stripe-publishable-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.stripeLivePublishable);
    expect(match).not.toBeNull();
  });

  it("detects OpenAI API key (v1 format)", () => {
    const pattern = PATTERNS.find((p) => p.id === "openai-api-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.openaiKeyV1);
    expect(match).not.toBeNull();
  });

  it("detects OpenAI API key (v2/project format)", () => {
    const pattern = PATTERNS.find((p) => p.id === "openai-api-key-v2")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.openaiKeyV2);
    expect(match).not.toBeNull();
  });

  it("detects Anthropic API key", () => {
    const pattern = PATTERNS.find((p) => p.id === "anthropic-api-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.anthropicKey);
    expect(match).not.toBeNull();
  });

  it("detects Google API key", () => {
    const pattern = PATTERNS.find((p) => p.id === "google-api-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.googleApiKey);
    expect(match).not.toBeNull();
  });

  it("detects PostgreSQL URL with password", () => {
    const pattern = PATTERNS.find((p) => p.id === "database-url")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.databaseUrl);
    expect(match).not.toBeNull();
  });

  it("detects MongoDB+SRV URL with password", () => {
    const pattern = PATTERNS.find((p) => p.id === "database-url")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.mongoUrl);
    expect(match).not.toBeNull();
  });

  it("detects SSH private key", () => {
    const pattern = PATTERNS.find((p) => p.id === "ssh-private-key")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.sshPrivateKey);
    expect(match).not.toBeNull();
  });

  it("detects JWT", () => {
    const pattern = PATTERNS.find((p) => p.id === "jwt")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(TRUE_POSITIVES.jwt);
    expect(match).not.toBeNull();
  });
});

describe("patterns - false positives (should NOT match or should be filtered)", () => {
  it("allowlists AWS example key", () => {
    expect(ALLOWLIST.has(FALSE_POSITIVES.awsExampleKey)).toBe(true);
  });

  it("does not match Stripe test keys as live keys", () => {
    const livePattern = PATTERNS.find((p) => p.id === "stripe-secret-key")!;
    livePattern.regex.lastIndex = 0;
    const match = livePattern.regex.exec(FALSE_POSITIVES.stripeTestKey);
    expect(match).toBeNull();
  });

  it("does not match DB URL without password", () => {
    const pattern = PATTERNS.find((p) => p.id === "database-url")!;
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(FALSE_POSITIVES.dbUrlNoPassword);
    expect(match).toBeNull();
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
});
