/**
 * Shannon entropy calculator for secret detection confidence scoring.
 */
export function shannonEntropy(str: string): number {
  if (str.length === 0) {
    return 0;
  }

  const freq = new Map<string, number>();
  for (const char of str) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = str.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Check if a string has high enough entropy to likely be a secret.
 * Thresholds are calibrated for base64/hex-encoded secrets.
 */
export function hasHighEntropy(str: string, threshold = 3.5): boolean {
  return shannonEntropy(str) >= threshold;
}
