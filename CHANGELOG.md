# Changelog

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
