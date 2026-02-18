const MASK_CHAR = "\u2588"; // █

/**
 * Mask a secret string, preserving prefix and suffix for identification.
 */
export function maskSecret(
  secret: string,
  prefixLen: number,
  suffixLen: number
): string {
  if (secret.length <= prefixLen + suffixLen) {
    return MASK_CHAR.repeat(secret.length);
  }

  const prefix = secret.slice(0, prefixLen);
  const suffix = suffixLen > 0 ? secret.slice(-suffixLen) : "";
  const maskLen = secret.length - prefixLen - suffixLen;

  return prefix + MASK_CHAR.repeat(maskLen) + suffix;
}
