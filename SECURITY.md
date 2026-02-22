# Security Policy

## Security Model

SecretShields is designed with a strict local-first security model:

- **No network calls**: All detection, masking, and alerting happens entirely on your machine. SecretShields never connects to any server.
- **No telemetry**: Nothing is collected or transmitted.
- **No raw secret persistence**: Raw secrets exist briefly in-memory only (for the restore TTL window, default 60 seconds). After TTL expiry, the in-memory copy is discarded and cannot be recovered.
- **Persistent storage**: Only masked previews and non-sensitive metadata (provider name, severity, timestamp, rotation URL, status) are stored in VS Code's `globalState`. No raw secret material is ever written to disk.

## Clipboard Rewriting Behavior

SecretShields modifies your system clipboard when it detects secrets:

- **Auto-mask mode** (default): Detected secrets are replaced with masked versions in-place on the clipboard.
- **Restore**: If you choose to restore a secret, the original is written back to the clipboard temporarily. This triggers a rotation reminder.

Users should be aware that clipboard contents are actively modified. This is the core protection mechanism.

## What to Report

Please report security issues if you discover:

- Raw secret material being written to disk, logs, or persistent storage
- Secret material leaking through masked previews or exposure log entries
- Detection patterns that produce dangerous false negatives (fail to detect known secret formats)
- Any network requests made by the extension
- Clipboard data being sent to any external service

## How to Report

For security vulnerabilities, please open a private security advisory on the GitHub repository rather than a public issue.

For non-security bugs (false positives, UI issues, etc.), open a regular GitHub issue.

## Disable / Uninstall Behavior

SecretShields **does not restore raw secrets** when disabled, deactivated, or uninstalled. This is a deliberate security decision:

- The `deactivate()` function and the defensive `onDidChange` handler stop all clipboard monitoring immediately — no new masking occurs after shutdown.
- Previously-masked clipboard contents remain masked at the OS level. The raw secret may no longer exist in memory (it is held only for the configurable restore TTL window, then discarded).
- Writing raw secrets back to the clipboard on deactivation would create an exposure window after the user has explicitly chosen to remove the tool.

If your clipboard contains masked text after uninstalling, simply copy any other text to overwrite it.

## Scope

This policy covers the SecretShields extension code. It does not cover:

- VS Code's own clipboard handling or security model
- Third-party extensions that may read the clipboard
- Operating system clipboard managers
