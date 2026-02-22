# SecretShields — Secret Shield for AI Chat

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/secretshields.secretshields?label=VS%20Code%20Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=secretshields.secretshields)
[![OpenVSX](https://img.shields.io/open-vsx/v/secretshields/secretshields?label=OpenVSX%20(Cursor)&color=purple)](https://open-vsx.org/extension/secretshields/secretshields)
[![CI](https://github.com/Leectan/secretshields/actions/workflows/ci.yml/badge.svg)](https://github.com/Leectan/secretshields/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

SecretShields is a local-first VS Code / Cursor extension that automatically masks secrets in your clipboard before you paste them anywhere — including AI chat windows, terminals, and pastebins.

## How It Works

1. **Copy** text containing a secret (API key, token, DB URL, etc.)
2. **SecretShields detects** the secret within ~1 second (configurable via `pollIntervalMs`) and replaces your clipboard with a masked version
3. **Paste** anywhere safely — the secret is already masked
4. **Restore** (optional) — if you intentionally need the secret, restore it within a short time window. This triggers a rotation reminder.

## Features

- **Automatic clipboard masking** — secrets are detected and masked within ~1 second of copying (polling-based, configurable)
- **39 detection patterns across 30+ platforms** — AWS, GitHub, Stripe, OpenAI, Anthropic, Google, Vercel, Slack, SendGrid, Shopify, Twilio, DigitalOcean, npm, PyPI, HashiCorp Vault, Doppler, Linear, Grafana, New Relic, Heroku, PlanetScale, Docker Hub, Resend, Supabase, Netlify, Appwrite, Cloudflare, Discord, database URLs, SSH keys, JWTs, and more
- **Low false-positive design** — allowlist for known example values, Shannon entropy filtering, structural JWT validation, placeholder password detection for database URLs, template variable filtering, and per-pattern validation hooks
- **Per-detector toggles** — enable or disable detection for each platform individually via settings
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

## Supported Platforms

| Platform | Patterns | Prefix / Format |
|----------|----------|-----------------|
| AWS | Access Key ID, Secret Key | `AKIA...`, keyword-based |
| GitHub | Classic PAT, Fine-grained PAT | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_` |
| Stripe | Secret, Restricted, Webhook | `sk_live_`, `rk_live_`, `whsec_` |
| OpenAI | v1, v2/project | `sk-...T3BlbkFJ...`, `sk-proj-` |
| Anthropic | API Key | `sk-ant-api03-` |
| Google | API Key | `AIza` |
| Vercel | PAT, Blob token | `vcp_`, `vci_`, `vercel_blob_rw_` |
| Slack | Bot/user/app tokens, Webhooks | `xoxb-`, `xoxp-`, `xapp-`, hooks.slack.com |
| SendGrid | API Key | `SG.` |
| Shopify | Access Token | `shpat_`, `shpca_`, `shppa_`, `shpss_` |
| Twilio | API Key SID, Account SID | `SK`, context-based `AC` |
| DigitalOcean | PAT, OAuth, Refresh | `dop_v1_`, `doo_v1_`, `dor_v1_` |
| npm | Access Token | `npm_` |
| PyPI | Upload Token | `pypi-AgEIcHlwaS5vcmc` |
| HashiCorp Vault | Service, Batch tokens | `hvs.`, `hvb.` |
| Doppler | Personal, Service, CLI | `dp.pt.`, `dp.st.`, `dp.ct.` |
| Linear | API Key | `lin_api_` |
| Grafana | Service Account Token | `glsa_` |
| New Relic | User, Ingest, Browser | `NRAK-`, `NRII-`, `NRJS-` |
| Heroku | OAuth Token | `HRKU-` |
| PlanetScale | Token, Password, OAuth | `pscale_tkn_`, `pscale_pw_` |
| Docker Hub | PAT | `dckr_pat_` |
| Resend | API Key | `re_` |
| Supabase | Secret Key | `sb_secret_` |
| Netlify | PAT, CLI, OAuth | `nfp_`, `nfc_`, `nfo_` |
| Appwrite | Standard API Key | `standard_` + 256 hex |
| Cloudflare | Origin CA Key | `v1.0-` |
| Discord | Webhook URL | discord.com/api/webhooks |
| Database | URL with password | `postgresql://`, `mysql://`, `mongodb://`, `redis://` |
| SSH | Private Key | `-----BEGIN ... PRIVATE KEY-----` |
| JWT | JSON Web Token | `eyJ...` (structurally validated) |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `secretshields.enabled` | `true` | Enable/disable clipboard monitoring |
| `secretshields.autoMask` | `true` | Automatically mask detected secrets |
| `secretshields.restoreTTLSeconds` | `60` | Seconds to allow restoring original secret |
| `secretshields.pollIntervalMs` | `1000` | Clipboard polling interval (ms) |
| `secretshields.maskingSignal.mode` | `"statusBar"` | Always-visible masking feedback: `off`, `statusBar`, `output`, or `both` |
| `secretshields.countdownMinutes.critical` | `15` | Rotation reminder for critical secrets (min) |
| `secretshields.countdownMinutes.high` | `60` | Rotation reminder for high secrets (min) |
| `secretshields.countdownMinutes.medium` | `240` | Rotation reminder for medium secrets (min) |
| `secretshields.editorPasteMasking.mode` | `"offer"` | Editor paste masking: `off`, `offer`, or `auto` |
| `secretshields.detectors.*` | `true` | Per-platform detector toggles (32 toggles) |

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

## After Disabling or Uninstalling

- **Previously-masked clipboard contents remain masked.** SecretShields does not restore raw secrets when disabled or uninstalled — this is intentional. Restoring secrets on deactivation would be a security regression. If your clipboard contains masked text, simply copy any other text to overwrite it.
- **Disable/uninstall may require a window reload** to fully stop active clipboard monitoring in the current session. VS Code's extension host may continue running until you reload the window or restart the IDE.
- **Other open windows matter.** If you have multiple VS Code or Cursor windows open, any window with SecretShields still active can monitor the shared system clipboard.
- **Cursor's own scrubber is independent.** Cursor may have its own built-in heuristic that blocks secrets from being sent to AI providers. This is separate from SecretShields and will continue regardless of whether SecretShields is installed.

## Installation

Install from the VS Code Marketplace or OpenVSX (for Cursor).

## License

MIT
