# SecretShields — Secret Shield for AI Chat

SecretShields is a local-first VS Code / Cursor extension that automatically masks secrets in your clipboard before you paste them anywhere — including AI chat windows, terminals, and pastebins.

## How It Works

1. **Copy** text containing a secret (API key, token, DB URL, etc.)
2. **SecretShields detects** the secret within ~1 second (configurable via `pollIntervalMs`) and replaces your clipboard with a masked version
3. **Paste** anywhere safely — the secret is already masked
4. **Restore** (optional) — if you intentionally need the secret, restore it within a short time window. This triggers a rotation reminder.

## Features

- **Automatic clipboard masking** — secrets are detected and masked within ~1 second of copying (polling-based, configurable)
- **10+ secret patterns** — AWS keys, GitHub tokens, Stripe keys, OpenAI/Anthropic keys, Google API keys, database URLs, SSH keys, JWTs
- **Restore with TTL** — deliberately restore a masked secret for a short window (configurable, default 60s)
- **Rotation reminders** — restoring a secret starts a countdown; when it expires, you get a reminder to rotate with a direct link to the provider's rotation page
- **Exposure log** — track which secrets were exposed, when, and whether they've been rotated
- **100% local** — no network calls, no telemetry, no data leaves your machine

## Privacy Model

SecretShields is designed with privacy as a core feature:

- **No network calls** — detection, masking, and alerts are entirely local
- **No raw secret persistence** — raw secrets exist briefly in-memory only (for the restore TTL window); persistent storage holds only masked previews and metadata
- **No telemetry** — nothing is sent anywhere

## Commands

| Command | Description |
|---------|-------------|
| `SecretShields: Mask Clipboard Now` | Manually mask the current clipboard contents |
| `SecretShields: Restore Last Secret (Time-Limited)` | Restore the original secret (only within TTL window) |
| `SecretShields: Show Exposure Log` | Open the exposure log panel |
| `SecretShields: Clear Exposure Log` | Clear all exposure history |
| `SecretShields: Mark Secret as Rotated` | Mark an exposed secret as rotated |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `secretshields.enabled` | `true` | Enable/disable clipboard monitoring |
| `secretshields.autoMask` | `true` | Automatically mask detected secrets |
| `secretshields.restoreTTLSeconds` | `60` | Seconds to allow restoring original secret |
| `secretshields.pollIntervalMs` | `1000` | Clipboard polling interval (ms) |
| `secretshields.countdownMinutes.critical` | `15` | Rotation reminder for critical secrets (min) |
| `secretshields.countdownMinutes.high` | `60` | Rotation reminder for high secrets (min) |
| `secretshields.countdownMinutes.medium` | `240` | Rotation reminder for medium secrets (min) |
| `secretshields.editorPasteMasking.mode` | `"offer"` | Editor paste masking: `off`, `offer`, or `auto` |

## Editor Paste Masking

In addition to clipboard masking, SecretShields can intercept paste operations in code editors:

- When you paste text containing secrets into a code editor, the **paste widget** offers a "Paste with SecretShields masking" option
- In `offer` mode (default): normal paste remains the default; masked paste is selectable from the paste widget
- In `auto` mode: SecretShields attempts to make masked paste the default (best-effort, depends on other paste providers)
- In `off` mode: SecretShields does not participate in editor paste at all

Configure via `secretshields.editorPasteMasking.mode` in settings.

**Note**: Editor paste masking works in code editor panes only. It does not apply to terminal, chat panels, or webview-based inputs.

## Beta Notes

This is a public beta. Please help improve SecretShields:

- **False positives** (non-secrets getting masked): Open an issue with the masked text pattern (never include real secrets). We'll add it to the allowlist.
- **False negatives** (real secrets not detected): Open an issue describing the secret format (e.g., "Acme Corp API keys start with `acme_`"). We'll add a detection pattern.
- **Temporarily disable**: Set `secretshields.enabled` to `false` in VS Code settings, or click "Disable SecretShields" in the masking notification.
- Clipboard masking is **polling-based** — detection occurs within the configured `pollIntervalMs` (default 1000ms), not instantly on copy.

## Limitations (MVP)

- SecretShields masks your clipboard proactively. It **cannot** intercept paste events inside Cursor or Copilot chat input fields directly (VS Code extensions cannot inject into other extensions' webviews).
- Editor paste masking is available for code editor panes only (TextDocuments), configurable via `secretshields.editorPasteMasking.mode`. It is optional and **not relied on** for core AI chat protection — clipboard-first masking remains the primary defense.
- Rotation is manual — SecretShields opens the provider's rotation page but does not auto-rotate credentials.

## Installation

Install from the VS Code Marketplace or OpenVSX (for Cursor).

## License

MIT
