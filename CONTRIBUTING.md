# Contributing to SecretShields

Thanks for your interest in contributing! This guide will get you up and running.

## Reporting Issues

We have issue templates for the most common cases:

- **[False Positive](https://github.com/Leectan/secretshields/issues/new?template=false-positive.md)** — text was masked but shouldn't have been
- **[False Negative](https://github.com/Leectan/secretshields/issues/new?template=false-negative.md)** — a real secret was not detected
- **[UX Friction](https://github.com/Leectan/secretshields/issues/new?template=ux-friction.md)** — workflow disruption or improvement suggestion

**Never paste real secrets in issues.** Use synthetic examples that match the format.

## Development Setup

```bash
git clone https://github.com/Leectan/secretshields.git
cd secretshields
npm install
npm run build
npm test          # runs all unit tests (vitest)
```

To test inside VS Code/Cursor, press `F5` to launch the Extension Development Host.

## Project Structure

```
src/
├── extension.ts              # Entry point (activate/deactivate)
├── detection/
│   ├── patterns.ts           # All secret patterns (SecretPattern[])
│   ├── engine.ts             # Detection engine (runs patterns against text)
│   ├── masker.ts             # Masking logic (prefix████suffix)
│   └── entropy.ts            # Shannon entropy calculator
├── interception/
│   ├── clipboardMonitor.ts   # System clipboard polling + auto-mask
│   └── documentPasteProvider.ts  # Editor paste interception
├── rotation/                 # Exposure log + rotation reminders
├── chat/                     # Chat participant (future)
└── ui/                       # Status bar + notifications
test/
├── unit/                     # Unit tests (vitest)
└── fixtures/                 # Synthetic secret samples
```

## Adding a New Detector

This is the most common contribution. Each detector is a `SecretPattern` object in `src/detection/patterns.ts`.

### 1. Add the pattern

```typescript
{
  id: "provider-key-type",         // unique kebab-case ID
  name: "Provider Key Type",       // human-readable name
  provider: "Provider",            // provider name (for rotation URLs)
  regex: /\b(your-regex-here)\b/g, // regex with ONE capture group for the secret
  severity: "critical",            // "critical" | "high" | "medium"
  rotationUrl: "https://...",      // link to rotate/revoke the credential (or null)
  prefixLen: 4,                    // characters to keep visible at start
  suffixLen: 4,                    // characters to keep visible at end
  entropyThreshold: 0,             // minimum Shannon entropy (0 = skip check)
  configKey: "secretshields.detectors.yourDetector",
}
```

### 2. Register the config key

Add a matching boolean entry in `package.json` under `contributes.configuration.properties`:

```json
"secretshields.detectors.yourDetector": {
  "type": "boolean",
  "default": true,
  "description": "Detect Provider key type."
}
```

### 3. Add test fixtures

Add synthetic (fake) examples to `test/fixtures/secrets.ts` and corresponding test cases to `test/unit/patterns.test.ts`:

```typescript
// In secrets.ts — TRUE_POSITIVES
yourDetector: "synth_xxxxxxxxxxxxxxxxxxxxxxxx",

// In patterns.test.ts
it("detects Provider key", () => {
  expectMatch("provider-key-type", TRUE_POSITIVES.yourDetector);
});
```

If relevant, add false positive examples too — strings that look similar but should **not** match.

### 4. Run tests

```bash
npm test
```

All 108+ tests must pass. The CI pipeline runs the same suite on every PR.

## False Positive Reduction

If you're fixing a false positive, you have several tools:

- **Allowlist**: Add known example/documentation values to the `ALLOWLIST` set in `patterns.ts`
- **Placeholder passwords**: Add common dummy passwords to `PLACEHOLDER_PASSWORDS`
- **Entropy threshold**: Set `entropyThreshold` > 0 to reject low-entropy matches
- **Validate function**: Add a `validate` callback for structural checks (see `validateJwtStructure` for an example)
- **Template variable detection**: The `isTemplateVariable()` helper rejects `${VAR}`, `{{VAR}}`, and similar patterns

## Pull Request Guidelines

1. Fork the repo and create a branch from `main`
2. Keep changes focused — one detector or one fix per PR
3. Include tests for any new patterns
4. Run `npm run lint && npm test` before submitting
5. Describe what the pattern matches and link to the provider's documentation if possible

## Code of Conduct

Be respectful and constructive. We're all here to make dev workflows safer.
