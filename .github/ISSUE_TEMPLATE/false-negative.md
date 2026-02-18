---
name: False Negative
about: Report a secret that Redakt failed to detect
title: "[FN] "
labels: false-negative, detection
---

## Secret type / provider

<!-- e.g., "Slack webhook URL", "Azure storage key", "Twilio auth token" -->

## Expected detection

<!-- What should Redakt have done? e.g., "Should have masked the entire token" -->

## Where did it leak?

- [ ] Clipboard (was not auto-masked on copy)
- [ ] Editor paste widget (no "Paste with Redakt masking" option offered)

## Synthetic example

<!-- Provide a SYNTHETIC string that matches the format of the missed secret. Do NOT paste real credentials. Clearly mark it as fake. -->

```
FAKE_EXAMPLE: [SYNTHETIC_TOKEN_DO_NOT_USE_REAL_CREDS]
```

## Pattern details (if known)

<!-- Any regex or format info that could help. e.g., "Starts with xoxb-, 50+ chars, alphanumeric" -->

## Environment

- **OS**: <!-- e.g., macOS 14.2, Windows 11, Ubuntu 22.04 -->
- **IDE**: <!-- e.g., VS Code 1.92, Cursor 0.40 -->
- **Redakt version**: <!-- e.g., 0.1.1 -->

## Relevant settings

<!-- List any non-default Redakt settings. Were any detectors disabled? -->

```json
{
}
```
