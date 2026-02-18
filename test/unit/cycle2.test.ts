import { describe, it, expect } from "vitest";
import { detectSecrets, maskAllSecrets } from "../../src/detection/engine";
import { maskSecret } from "../../src/detection/masker";
import { PATTERNS } from "../../src/detection/patterns";
import { TRUE_POSITIVES } from "../fixtures/secrets";

describe("SSH private key masking safety (Task 12)", () => {
  const sshPattern = PATTERNS.find((p) => p.id === "ssh-private-key")!;

  it("SSH pattern has prefixLen 0 and suffixLen 0 (total masking)", () => {
    expect(sshPattern.prefixLen).toBe(0);
    expect(sshPattern.suffixLen).toBe(0);
  });

  it("masked SSH key is entirely mask characters (zero original content)", () => {
    const results = detectSecrets(TRUE_POSITIVES.sshPrivateKey);
    expect(results.length).toBe(1);

    const masked = results[0].masked;
    // Every character must be the mask char — no original content whatsoever
    const maskChar = "\u2588";
    expect(masked).toBe(maskChar.repeat(results[0].raw.length));
  });

  it("no header, body, or footer content survives masking for RSA key", () => {
    const key = `-----BEGIN RSA PRIVATE KEY-----\nMIIBogIBAAJBALRiMLAHudeSA/x\n-----END RSA PRIVATE KEY-----`;
    const results = detectSecrets(key);
    expect(results.length).toBe(1);
    expect(results[0].masked).not.toContain("BEGIN");
    expect(results[0].masked).not.toContain("END");
    expect(results[0].masked).not.toContain("MII");
    expect(results[0].masked).not.toContain("PRIVATE");
  });

  it("no content survives masking for EC key", () => {
    const key = `-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIBkg0L\n-----END EC PRIVATE KEY-----`;
    const results = detectSecrets(key);
    expect(results.length).toBe(1);
    expect(results[0].masked).not.toContain("BEGIN");
    expect(results[0].masked).not.toContain("MHQ");
  });

  it("no content survives masking for OPENSSH key", () => {
    const key = `-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAA\n-----END OPENSSH PRIVATE KEY-----`;
    const results = detectSecrets(key);
    expect(results.length).toBe(1);
    expect(results[0].masked).not.toContain("BEGIN");
    expect(results[0].masked).not.toContain("b3Bl");
  });

  it("masker produces all mask chars when prefixLen and suffixLen are both 0", () => {
    const maskChar = "\u2588";
    const result = maskSecret("some-secret-key-material", 0, 0);
    expect(result).toBe(maskChar.repeat(24));
  });
});

describe("countdown config decoupled from engine (Task 11)", () => {
  it("DetectionResult has no countdownMinutes field", () => {
    const results = detectSecrets(TRUE_POSITIVES.awsAccessKeyId);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // countdownMinutes should not exist on the result
    expect("countdownMinutes" in results[0]).toBe(false);
  });

  it("DetectionResult has severity for caller to resolve countdown", () => {
    const results = detectSecrets(TRUE_POSITIVES.googleApiKey);
    expect(results[0].severity).toBe("high");
  });
});

describe("multi-secret masking stability", () => {
  it("rapid repeated masking of same text produces identical output", () => {
    const text = `KEY=${TRUE_POSITIVES.awsAccessKeyId} TOKEN=${TRUE_POSITIVES.githubPat}`;
    const r1 = maskAllSecrets(text);
    const r2 = maskAllSecrets(text);
    expect(r1.masked).toBe(r2.masked);
    expect(r1.detections.length).toBe(r2.detections.length);
  });
});
