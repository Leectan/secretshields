import { describe, it, expect } from "vitest";
import { processPasteText } from "../../src/interception/documentPasteProvider";
import { TRUE_POSITIVES, MULTI_SECRET_TEXT } from "../fixtures/secrets";

describe("processPasteText", () => {
  it("returns masked text and count when secrets are present", () => {
    const result = processPasteText(TRUE_POSITIVES.awsAccessKeyId);
    expect(result).not.toBeNull();
    expect(result!.detectionCount).toBeGreaterThanOrEqual(1);
    expect(result!.maskedText).toContain("\u2588");
    expect(result!.maskedText).not.toBe(TRUE_POSITIVES.awsAccessKeyId);
  });

  it("returns null when no secrets are found", () => {
    const result = processPasteText("Just a normal paste of clean text.");
    expect(result).toBeNull();
  });

  it("handles multiple secrets in one paste", () => {
    const result = processPasteText(MULTI_SECRET_TEXT);
    expect(result).not.toBeNull();
    expect(result!.detectionCount).toBeGreaterThanOrEqual(3);
    expect(result!.maskedText).not.toContain("AKIAIOSFODNN7EXAMPL1");
  });

  it("returns null for empty text", () => {
    const result = processPasteText("");
    expect(result).toBeNull();
  });

  it("returns null for allowlisted values", () => {
    const result = processPasteText("AKIAIOSFODNN7EXAMPLE");
    expect(result).toBeNull();
  });

  it("preserves non-secret text around masked secrets", () => {
    const text = `Config: KEY=${TRUE_POSITIVES.awsAccessKeyId} done`;
    const result = processPasteText(text);
    expect(result).not.toBeNull();
    expect(result!.maskedText).toContain("Config: KEY=");
    expect(result!.maskedText).toContain(" done");
  });

  it("masked text has same length as original for inline secrets", () => {
    const text = TRUE_POSITIVES.awsAccessKeyId;
    const result = processPasteText(text);
    expect(result).not.toBeNull();
    expect(result!.maskedText.length).toBe(text.length);
  });

  it("never returns the raw secret in maskedText", () => {
    const result = processPasteText(TRUE_POSITIVES.githubPat);
    expect(result).not.toBeNull();
    expect(result!.maskedText).not.toBe(TRUE_POSITIVES.githubPat);
    // The full original should not appear in the masked output
    expect(result!.maskedText).not.toContain(
      TRUE_POSITIVES.githubPat.slice(4, -4)
    );
  });

  it("returns null when the matching detector is disabled via enabledPatterns", () => {
    // AWS key should be detected with all detectors enabled
    const withAll = processPasteText(TRUE_POSITIVES.awsAccessKeyId);
    expect(withAll).not.toBeNull();

    // Disable AWS detector by omitting its config key from the enabled set
    const onlyGitHub = new Set(["secretshields.detectors.githubTokens"]);
    const withoutAws = processPasteText(TRUE_POSITIVES.awsAccessKeyId, onlyGitHub);
    expect(withoutAws).toBeNull();
  });
});
