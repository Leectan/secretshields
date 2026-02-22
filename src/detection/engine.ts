import { PATTERNS, ALLOWLIST, type Severity } from "./patterns";
import { maskSecret } from "./masker";
import { hasHighEntropy } from "./entropy";

export interface DetectionResult {
  patternId: string;
  name: string;
  provider: string;
  severity: Severity;
  /** Start index in the original text */
  start: number;
  /** End index in the original text */
  end: number;
  /** The raw secret match */
  raw: string;
  /** Masked version of the secret */
  masked: string;
  /** URL for rotating this credential (null if unknown) */
  rotationUrl: string | null;
}

/**
 * Detect secrets in text using all enabled patterns.
 * Returns matches sorted by start position (stable for replacement).
 */
export function detectSecrets(
  text: string,
  enabledPatterns?: Set<string>
): DetectionResult[] {
  const results: DetectionResult[] = [];

  for (const pattern of PATTERNS) {
    if (enabledPatterns && !enabledPatterns.has(pattern.configKey)) {
      continue;
    }

    // Reset regex state for global patterns
    pattern.regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(text)) !== null) {
      const raw = match[1] ?? match[0];
      const start = match.index + (match[0].indexOf(raw));
      const end = start + raw.length;

      // Skip allowlisted values
      if (ALLOWLIST.has(raw)) {
        continue;
      }

      // Check entropy threshold if configured
      if (pattern.entropyThreshold > 0 && !hasHighEntropy(raw, pattern.entropyThreshold)) {
        continue;
      }

      // Run pattern-specific validation if defined
      if (pattern.validate && !pattern.validate(raw, match)) {
        continue;
      }

      const masked = maskSecret(raw, pattern.prefixLen, pattern.suffixLen);

      results.push({
        patternId: pattern.id,
        name: pattern.name,
        provider: pattern.provider,
        severity: pattern.severity,
        start,
        end,
        raw,
        masked,
        rotationUrl: pattern.rotationUrl,
      });
    }
  }

  // Sort by start position descending for safe right-to-left replacement
  results.sort((a, b) => a.start - b.start);

  return results;
}

/**
 * Replace all detected secrets in text with their masked versions.
 * Processes replacements right-to-left to preserve indices.
 */
export function maskAllSecrets(
  text: string,
  enabledPatterns?: Set<string>
): { masked: string; detections: DetectionResult[] } {
  const detections = detectSecrets(text, enabledPatterns);

  if (detections.length === 0) {
    return { masked: text, detections };
  }

  // Deduplicate overlapping ranges (keep the longer / earlier match)
  const deduped = deduplicateOverlaps(detections);

  // Replace right-to-left to preserve indices
  let masked = text;
  for (let i = deduped.length - 1; i >= 0; i--) {
    const d = deduped[i];
    masked = masked.slice(0, d.start) + d.masked + masked.slice(d.end);
  }

  return { masked, detections: deduped };
}

/**
 * Remove overlapping detections, keeping the longer match.
 */
function deduplicateOverlaps(detections: DetectionResult[]): DetectionResult[] {
  if (detections.length <= 1) {
    return detections;
  }

  const result: DetectionResult[] = [detections[0]];

  for (let i = 1; i < detections.length; i++) {
    const prev = result[result.length - 1];
    const curr = detections[i];

    // If current overlaps with previous, keep the longer one
    if (curr.start < prev.end) {
      if (curr.raw.length > prev.raw.length) {
        result[result.length - 1] = curr;
      }
      // Otherwise keep prev (already in result)
    } else {
      result.push(curr);
    }
  }

  return result;
}
