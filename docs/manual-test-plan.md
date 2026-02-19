# Manual Test Plan — Cycle 3

Validate all Cycle 3 changes in VS Code and Cursor. Total time: ~20 minutes.

## Prerequisites

- Install the VSIX: `code --install-extension secretshields-X.Y.Z.vsix`
- Or for Cursor: `cursor --install-extension secretshields-X.Y.Z.vsix`
- Reset all `secretshields.*` settings to defaults

## Test 1: Clipboard Masking Still Works (5 min)

### Steps
1. Copy `AKIAIOSFODNN7TESTKEY1` to clipboard
2. Wait ~1 second

### Expected
- Notification: "SecretShields: Masked 1 secret(s) in clipboard."
- Three buttons: "Keep Masked (Safe)", "Restore for 60s (Exposes)", "Disable SecretShields"
- Paste into any editor: shows `AKIA████████████KEY1`

### Screenshot description
- Notification banner at bottom-right with masking message and action buttons
- Pasted text in editor showing masked AWS key with `█` characters

### Steps (clean text)
1. Copy `Hello world` to clipboard
2. Wait ~2 seconds

### Expected
- No notification appears
- Paste shows `Hello world` unchanged

---

## Test 2: Editor Paste Widget — "offer" Mode (5 min)

### Steps
1. Ensure `secretshields.editorPasteMasking.mode` is `"offer"` (default)
2. Copy `AKIAIOSFODNN7TESTKEY1` to system clipboard (from outside VS Code to avoid clipboard masking)
   - Alternative: temporarily set `secretshields.autoMask` to `false`, copy the key, then set it back
3. Open any `.ts` or `.txt` file in the editor
4. Paste (Ctrl+V / Cmd+V)

### Expected
- Text pastes normally (unmasked) as the default action
- A small paste widget appears at the paste location (the "..." dropdown)
- Clicking the widget shows "Paste with SecretShields masking (1 secret masked)" as an alternative
- Selecting it replaces the pasted text with the masked version

### Screenshot description
- Paste widget dropdown showing two options: default paste and "Paste with SecretShields masking"

---

## Test 3: Editor Paste Widget — "off" Mode (2 min)

### Steps
1. Set `secretshields.editorPasteMasking.mode` to `"off"` in settings
2. Copy a secret, paste into editor

### Expected
- No "Paste with SecretShields masking" option in the paste widget
- Only default paste options appear

### Steps (re-enable)
1. Set `secretshields.editorPasteMasking.mode` back to `"offer"`
2. Copy a secret, paste into editor

### Expected
- "Paste with SecretShields masking" option reappears without restart

---

## Test 4: Editor Paste Widget — Clean Text (1 min)

### Steps
1. Copy `Hello world` to clipboard
2. Paste into editor

### Expected
- No "Paste with SecretShields masking" option appears (no secrets detected)
- Only default paste options

---

## Test 5: Cursor Compatibility (3 min)

Repeat Tests 2 and 3 in Cursor instead of VS Code.

### Expected
- Same behavior as VS Code for editor panes
- Paste widget works identically

### Notes
- If Cursor uses a different VS Code engine version, behavior may vary
- Document any differences observed

---

## Test 6: Exposure Log and Status Bar (2 min)

### Steps
1. Copy a secret, let it auto-mask, then restore it
2. Check the Activity Bar for the SecretShields shield icon
3. Click the icon to open the Exposure Log

### Expected
- Shield icon visible in Activity Bar (custom SVG, not a missing icon placeholder)
- Status bar shows "SecretShields: 1 exposed" with warning background
- Exposure Log tree view shows the event with masked preview, severity, and age
- No raw secret visible anywhere in the UI

---

## Test 7: New Docs Exist (2 min)

### Verify files exist and are non-empty
- [ ] `CHANGELOG.md` — has v0.1.0 and v0.1.1 entries
- [ ] `SECURITY.md` — documents security model
- [ ] `LICENSE` — MIT license text
- [ ] `.gitignore` — ignores node_modules, dist, *.vsix
- [ ] `docs/public-beta-checklist.md` — executable checklist

---

## Result Summary

| Test | VS Code | Cursor |
|------|---------|--------|
| 1. Clipboard masking | Pass / Fail | Pass / Fail |
| 2. Paste widget (offer) | Pass / Fail | Pass / Fail |
| 3. Paste widget (off) | Pass / Fail | Pass / Fail |
| 4. Clean text paste | Pass / Fail | Pass / Fail |
| 5. Cursor compat | N/A | Pass / Fail |
| 6. Exposure log + status bar | Pass / Fail | Pass / Fail |
| 7. Docs exist | Pass / Fail | N/A |
