import { describe, it, expect } from "vitest";
import { detectSecrets, maskAllSecrets } from "../../src/detection/engine";
import {
  TRUE_POSITIVES,
  MULTI_SECRET_TEXT,
} from "../fixtures/secrets";

describe("detectSecrets", () => {
  it("detects AWS access key in isolation", () => {
    const results = detectSecrets(TRUE_POSITIVES.awsAccessKeyId);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].provider).toBe("AWS");
  });

  it("detects multiple secrets in a single text", () => {
    const results = detectSecrets(MULTI_SECRET_TEXT);
    expect(results.length).toBeGreaterThanOrEqual(3);

    const providers = results.map((r) => r.provider);
    expect(providers).toContain("AWS");
    expect(providers).toContain("GitHub");
    expect(providers).toContain("Database");
  });

  it("returns results sorted by start position", () => {
    const results = detectSecrets(MULTI_SECRET_TEXT);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].start).toBeGreaterThanOrEqual(results[i - 1].start);
    }
  });

  it("includes masked version in results", () => {
    const results = detectSecrets(TRUE_POSITIVES.awsAccessKeyId);
    expect(results[0].masked).toContain("█");
    expect(results[0].masked.length).toBe(results[0].raw.length);
  });

  it("includes rotation URL for known providers", () => {
    const results = detectSecrets(TRUE_POSITIVES.githubPat);
    expect(results[0].rotationUrl).toBe("https://github.com/settings/tokens");
  });

  it("severity is set correctly for countdown resolution by caller", () => {
    const results = detectSecrets(TRUE_POSITIVES.githubPat);
    expect(results[0].severity).toBe("critical");
  });

  it("returns empty array for clean text", () => {
    const results = detectSecrets("Hello, this is just a normal message.");
    expect(results).toHaveLength(0);
  });

  it("skips allowlisted values", () => {
    const results = detectSecrets("AKIAIOSFODNN7EXAMPLE");
    expect(results).toHaveLength(0);
  });
});

describe("maskAllSecrets", () => {
  it("replaces secrets with masked versions in text", () => {
    const { masked, detections } = maskAllSecrets(MULTI_SECRET_TEXT);

    expect(detections.length).toBeGreaterThanOrEqual(3);
    expect(masked).not.toContain("AKIAIOSFODNN7EXAMPLA");
    expect(masked).toContain("█");
    // Providers that appear in context should still be readable
    expect(masked).toContain("AWS_ACCESS_KEY_ID=");
  });

  it("returns original text when no secrets found", () => {
    const text = "Just a normal message with no secrets.";
    const { masked, detections } = maskAllSecrets(text);
    expect(masked).toBe(text);
    expect(detections).toHaveLength(0);
  });

  it("handles multiple secrets without corrupting text", () => {
    const { masked } = maskAllSecrets(MULTI_SECRET_TEXT);
    // Should still have the surrounding text
    expect(masked).toContain("Here are my credentials:");
    expect(masked).toContain("GITHUB_TOKEN=");
    expect(masked).toContain("DATABASE_URL=");
  });

  it("preserves text length proportionally", () => {
    const text = `KEY=${TRUE_POSITIVES.awsAccessKeyId}`;
    const { masked } = maskAllSecrets(text);
    // Masked text should be same length as original
    expect(masked.length).toBe(text.length);
  });
});

describe("performance", () => {
  it("processes 10KB input in < 50ms", () => {
    // Generate a 10KB payload with some secrets sprinkled in
    const chunk = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
    let payload = chunk.repeat(Math.ceil(10000 / chunk.length)).slice(0, 9500);
    payload += `\nAKIAIOSFODNN7EXAMPLA\nghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij\n`;
    payload += chunk.repeat(5);

    const start = performance.now();
    const { detections } = maskAllSecrets(payload);
    const elapsed = performance.now() - start;

    expect(detections.length).toBeGreaterThanOrEqual(2);
    expect(elapsed).toBeLessThan(50);
  });
});
