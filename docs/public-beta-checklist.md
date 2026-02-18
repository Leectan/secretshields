# Public Beta Checklist

Execute each step in order. Total time: ~15 minutes.

## Prerequisites
- VS Code or Cursor with Redakt installed (via VSIX or marketplace)
- Default settings (or reset `redakt.*` settings to defaults)

## 1. Clipboard Masking (5 min)

- [ ] **Copy an AWS key**: Copy `AKIAIOSFODNN7TESTKEY1` to clipboard. Within ~1 second, a notification should appear saying "Masked 1 secret(s)". Paste into any editor — should show `AKIA████████████KEY1` (masked).
- [ ] **Copy clean text**: Copy `Hello world` to clipboard. No notification should appear. Paste — should show `Hello world` unchanged.
- [ ] **Copy multiple secrets**: Copy text containing both an AWS key and a GitHub token. Notification should say "Masked 2 secret(s)".
- [ ] **Manual mask**: Copy a secret, dismiss the notification, then run command `Redakt: Mask Clipboard Now`. Clipboard should be masked.

## 2. Restore TTL (3 min)

- [ ] **Restore within TTL**: Copy a secret, click "Restore for 60s (Exposes)" in notification. Paste — should show the original secret. Verify an exposure event appears in the Exposure Log.
- [ ] **TTL expiry**: Wait 60+ seconds after masking (without restoring). Run `Redakt: Restore Last Secret`. Should show "Restore window expired."

## 3. Exposure Log (2 min)

- [ ] **View exposure log**: Click the Redakt shield icon in the Activity Bar. Exposure events should be listed with provider, masked preview, severity, and age.
- [ ] **Verify no raw secrets**: Inspect each entry — only masked previews (with `█` characters) should appear. No raw secret material.
- [ ] **Mark rotated**: Right-click or use command `Redakt: Mark Secret as Rotated`. Status should change.
- [ ] **Clear log**: Run `Redakt: Clear Exposure Log`. Confirm modal appears. After clearing, log should be empty.

## 4. Rotation Reminders (2 min)

- [ ] **Countdown fires**: Restore a secret (creating an exposure). Set `redakt.countdownMinutes.critical` to `1` for testing. After ~1 minute, a warning notification should appear with "Open Rotation Page" action.
- [ ] **Correct provider page**: Click "Open Rotation Page" — should open the correct URL for the secret's provider (e.g., AWS IAM console for AWS keys).

## 5. Enable/Disable (1 min)

- [ ] **Disable via notification**: Copy a secret, click "Disable Redakt" in the notification. Copy another secret — no masking should occur.
- [ ] **Re-enable via settings**: Set `redakt.enabled` to `true` in VS Code settings. Copy a secret — masking should resume.

## 6. Editor Paste Masking (2 min)

- [ ] **Paste widget offer**: Copy a secret to clipboard, then paste (Ctrl+V) into a code editor file. The paste widget should show "Paste with Redakt masking" as an option.
- [ ] **Off mode**: Set `redakt.editorPasteMasking.mode` to `off`. Paste again — no Redakt option should appear in the paste widget.
- [ ] **Clean paste**: Copy clean text, paste into editor. No Redakt option should appear (no secrets detected).

## 7. No Raw Secrets in Storage (1 min)

- [ ] Open VS Code Developer Tools (Help > Toggle Developer Tools).
- [ ] In the Console, run: `JSON.stringify(await globalThis.vscode?.commands?.executeCommand('workbench.action.openGlobalState') ?? 'N/A')`
- [ ] Search for `redakt.exposureLog` in global state. Verify entries contain only `maskedPreview` fields with `█` characters — no raw secrets.

## Result

- [ ] All checks pass
- [ ] No raw secret material found in any persistent storage or UI element
- [ ] Extension works in both VS Code and Cursor
