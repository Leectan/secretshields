import { describe, it, expect } from "vitest";
import { maskSecret } from "../../src/detection/masker";

describe("maskSecret", () => {
  it("masks with prefix and suffix preserved", () => {
    const result = maskSecret("AKIAIOSFODNN7EXAMPLA", 4, 4);
    expect(result).toBe("AKIA████████████MPLA");
    expect(result.length).toBe(20);
  });

  it("masks fully when string is shorter than prefix + suffix", () => {
    const result = maskSecret("short", 4, 4);
    expect(result).toBe("█████");
  });

  it("masks with no suffix", () => {
    const result = maskSecret("postgresql://admin:pass@host/db", 15, 0);
    expect(result.startsWith("postgresql://ad")).toBe(true);
    expect(result.endsWith("█")).toBe(true);
    expect(result.length).toBe(31);
  });

  it("returns all mask chars for empty prefix and suffix", () => {
    const result = maskSecret("secretvalue", 0, 0);
    expect(result).toBe("███████████");
  });

  it("preserves original length", () => {
    const secret = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh";
    const result = maskSecret(secret, 4, 4);
    expect(result.length).toBe(secret.length);
  });
});
