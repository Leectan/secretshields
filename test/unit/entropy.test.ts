import { describe, it, expect } from "vitest";
import { shannonEntropy, hasHighEntropy } from "../../src/detection/entropy";

describe("shannonEntropy", () => {
  it("returns 0 for empty string", () => {
    expect(shannonEntropy("")).toBe(0);
  });

  it("returns 0 for single-char string", () => {
    expect(shannonEntropy("aaa")).toBe(0);
  });

  it("returns 1 for a two-char even string", () => {
    expect(shannonEntropy("ab")).toBeCloseTo(1.0, 5);
  });

  it("calculates higher entropy for random-like strings", () => {
    const random = "aB3$xY9!qZ7@mK2#";
    expect(shannonEntropy(random)).toBeGreaterThan(3.5);
  });

  it("calculates lower entropy for repetitive strings", () => {
    const repetitive = "aaabbbcccddd";
    expect(shannonEntropy(repetitive)).toBeLessThan(2.5);
  });
});

describe("hasHighEntropy", () => {
  it("returns true for high-entropy strings", () => {
    expect(hasHighEntropy("wJalrXUtnFEMI/K7MDENG/bPxRfiCY1234567890")).toBe(true);
  });

  it("returns false for low-entropy strings", () => {
    expect(hasHighEntropy("aaaaaaaaaa")).toBe(false);
  });

  it("respects custom threshold", () => {
    const str = "abcabc";
    const entropy = shannonEntropy(str);
    expect(hasHighEntropy(str, entropy - 0.1)).toBe(true);
    expect(hasHighEntropy(str, entropy + 0.1)).toBe(false);
  });
});
