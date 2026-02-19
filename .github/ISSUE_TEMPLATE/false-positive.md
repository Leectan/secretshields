---
name: False Positive
about: Report text that was incorrectly masked as a secret
title: "[FP] "
labels: false-positive, detection
---

## What got masked?

<!-- Describe what SecretShields treated as a secret (e.g., "a Base64 config string", "a test API key from docs") -->

## Why is it not a secret?

<!-- Explain why this string is safe (e.g., "it's a documentation example", "it's a random ID, not a credential") -->

## Where did masking occur?

- [ ] Clipboard (auto-mask on copy)
- [ ] Editor paste widget ("Paste with SecretShields masking")

## Redacted sample

<!-- Paste the MASKED version SecretShields produced (never paste real secrets). Example: AKIA████████████████ -->

```
<paste masked output here>
```

## Original format (synthetic example only)

<!-- Provide a SYNTHETIC string that matches the same pattern. Do NOT paste real credentials. -->

```
<paste synthetic example here>
```

## Environment

- **OS**: <!-- e.g., macOS 14.2, Windows 11, Ubuntu 22.04 -->
- **IDE**: <!-- e.g., VS Code 1.92, Cursor 0.40 -->
- **SecretShields version**: <!-- e.g., 0.2.0 -->

## Relevant settings

<!-- List any non-default SecretShields settings (e.g., disabled detectors, custom poll interval) -->

```json
{
}
```
