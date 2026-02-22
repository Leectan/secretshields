# Changelog

## [0.3.0] - 2026-02-22

### Added
- **27 new platform detectors** (39 total patterns across 30+ platforms): Vercel, Slack (tokens + webhooks), SendGrid, Shopify, Twilio, DigitalOcean, npm, PyPI, HashiCorp Vault, Doppler, Linear, Grafana, New Relic, Heroku, PlanetScale, Docker Hub, Resend, Supabase, Netlify, Appwrite, Cloudflare Origin CA, Discord webhooks.
- **Per-pattern `validate()` hook** for custom false positive filtering beyond regex and entropy.
- **Database URL placeholder password detection**: URLs with common placeholder passwords (`password`, `changeme`, `root`, `admin`, `secret`, `test`, etc.) and template variables (`${VAR}`, `{{VAR}}`) are automatically skipped.
- **JWT structural validation**: JWTs are now verified by decoding the base64url header and checking for a valid JSON object with an `alg` field.
- **Stripe publishable key toggle** (`secretshields.detectors.stripePublishableKeys`): separated from secret keys, disabled by default since publishable keys are designed to be public.
- 23 new per-platform detector toggle settings in VS Code configuration.
- Expanded ALLOWLIST with additional known documentation/example values.
- Supported Platforms table in README.

### Changed
- **Twilio detection split**: Account SID (`AC`) now requires keyword context (e.g., `account_sid=`, `TWILIO_ACCOUNT_SID=`) to avoid false positives from MD5 hashes. API Key SID (`SK`) remains prefix-only.
- **Resend regex tightened**: removed underscore from body charset to prevent matching variable names.
- **Slack token minimum body** raised from 10 to 20 characters.
- **OpenAI v2 key minimum body** raised from 40 to 80 characters.
- **AWS Access Key ID charset** corrected to base32 `[A-Z2-7]` (digits 0, 1, 8, 9 never appear in real keys).
- **Dynamic config key derivation**: `getEnabledPatterns()` in clipboardMonitor and documentPasteProvider now derives config keys from the PATTERNS array instead of a hardcoded list, ensuring new detectors work correctly when any detector is disabled.
- Stripe secret/restricted key pattern expanded to include test keys (`sk_test_`, `rk_test_`) and webhook signing secrets (`whsec_`).

## [0.2.4] - 2026-02-21

### Fixed
- Cancel in-flight clipboard masking when the extension is disabled or deactivated, preventing post-disable clipboard writes and stale toast actions from taking effect.
- Defensive best-effort handler stops clipboard monitoring immediately if the extension is uninstalled while the host is still running.
- Note: previously-masked clipboard contents remain masked (by design — SecretShields never restores raw secrets on shutdown).

## [0.2.3] - 2026-02-21

### Added
- Optional always-visible masking signal (`secretshields.maskingSignal.mode`) via status bar pulse and/or Output channel logging, so masking feedback still appears even when toast notifications are suppressed.

## [0.2.2] - 2026-02-21

### Fixed
- Clipboard masking no longer gets stuck if a clipboard write fails. SecretShields now recovers cleanly and warns once if masking cannot be applied.

## [0.2.1] - 2026-02-21

### Fixed
- Publishing to the VS Code Marketplace: removed an invalid `categories` value that caused `vsce publish` to fail.

## [0.2.0] - 2026-02-18

### Changed
- **Rebranded from Redakt to SecretShields**: All user-facing names, command IDs, configuration keys, and view IDs updated from `redakt.*` to `secretshields.*`.
- GitHub repository renamed from `Leectan/redakt` to `Leectan/secretshields`.
- GitHub Pages homepage updated to `https://leectan.github.io/secretshields/`.
- Existing exposure log data is automatically migrated from the old storage key.

### Breaking
- All settings keys changed from `redakt.*` to `secretshields.*` (e.g., `redakt.enabled` → `secretshields.enabled`). Users with customized settings will need to update their keys.
- All command IDs changed (e.g., `redakt.maskClipboard` → `secretshields.maskClipboard`). Users with custom keybindings will need to update.

## [0.1.1] - 2026-02-17

### Added
- **Editor paste masking**: When pasting into code editors, a "Paste with SecretShields masking" option appears in the paste widget. Configurable via `secretshields.editorPasteMasking.mode` (`offer`, `auto`, `off`).
- Beta notes section in README with guidance on reporting false positives.
- SECURITY.md documenting the security model.
- CHANGELOG.md, LICENSE, .gitignore.
- Public beta testing checklist and manual test plan.

### Fixed
- Clipboard polling race condition: replaced `setInterval` with self-scheduling `setTimeout` that awaits completion.
- SSH private key masking now uses total masking (prefixLen: 0, suffixLen: 0) — no key material is ever revealed.
- Countdown timer settings (`secretshields.countdownMinutes.*`) are now actually read from configuration instead of being hardcoded.
- Activity Bar icon now uses a proper SVG file instead of an invalid codicon string.
- Broken `test:integration` script no longer points to a non-existent file.
- ESLint configuration added; `npm run lint` now works and is included in CI.
- Documentation corrected: polling-based timing clarified, document paste API language updated.

## [0.1.0] - 2026-02-16

### Added
- **Clipboard-first secret masking**: Automatically detects and masks secrets in the clipboard within ~1 second (configurable polling interval).
- 12 secret detection patterns: AWS access key ID, AWS secret key, GitHub tokens (classic + fine-grained), Stripe live keys, OpenAI keys (v1 + v2/project), Anthropic keys, Google API keys, database URLs with passwords, SSH private keys, JWTs.
- Allowlist for known documentation/example values to reduce false positives.
- Shannon entropy filtering for high-confidence detection.
- **Restore with TTL**: Deliberately restore a masked secret for a configurable time window (default 60s).
- **Rotation reminders**: Restoring a secret starts a countdown; expiry shows a notification with a link to the provider's rotation page.
- **Exposure log**: TreeView tracking which secrets were exposed, when, and rotation status.
- Status bar indicator showing active exposure count.
- Commands: Mask Clipboard Now, Restore Last Secret, Show/Clear Exposure Log, Mark Rotated.

### Limitations
- Clipboard masking is polling-based, not instant — detection occurs within the configured `pollIntervalMs` (default 1000ms).
- Cannot intercept paste events inside Cursor or Copilot chat input fields (VS Code extensions cannot inject into other extensions' webviews).
- Rotation is manual — opens provider pages but does not auto-rotate credentials.
- No network calls, no telemetry. Entirely local.
