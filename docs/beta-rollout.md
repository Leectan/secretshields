# Public Beta Rollout Plan

Operational checklist for launching SecretShields as a public beta. Version must match `package.json`.

## Distribution Channels

### Primary Listings
- [ ] **VS Code Marketplace**: Published via `vsce publish` (see `docs/publishing-runbook.md`)
- [ ] **OpenVSX**: Published via `ovsx publish` (for Cursor and other VS Code forks)

### Discovery
- [ ] **GitHub README badge**: Add install/version badges to README.md
  ```markdown
  [![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/secretshields.secretshields)](https://marketplace.visualstudio.com/items?itemName=secretshields.secretshields)
  [![OpenVSX](https://img.shields.io/open-vsx/v/secretshields/secretshields)](https://open-vsx.org/extension/secretshields/secretshields)
  ```
- [ ] **GitHub repo description**: Set to "Local-first clipboard secret masking for VS Code and Cursor. Prevents accidental secret leakage into AI chats."
- [ ] **GitHub topics**: `vscode-extension`, `security`, `clipboard`, `secret-detection`, `ai-safety`

### Announcement Blurb

> **SecretShields** is now in public beta. It's a local-first VS Code/Cursor extension that automatically masks secrets when you copy them, so you never accidentally paste API keys or tokens into AI chats, terminals, or pastebins.
>
> No network calls. No telemetry. Everything runs locally.
>
> Try it: Install "SecretShields" from the VS Code Marketplace or OpenVSX.
>
> We need your feedback: false positives, missed secrets, and UX friction. File an issue at [github.com/Leectan/secretshields/issues](https://github.com/Leectan/secretshields/issues).

## Metrics to Track (Manual — Local-First)

Since SecretShields makes zero network calls, metrics are gathered manually from public sources:

| Metric | Source | Frequency |
|--------|--------|-----------|
| Install count | Marketplace dashboard + OpenVSX dashboard | Weekly |
| Star rating | Marketplace listing | Weekly |
| Issues opened | GitHub Issues | Daily during first 2 weeks, then weekly |
| Top false positives | GitHub Issues (label: `false-positive`) | Per-issue triage |
| Top false negatives | GitHub Issues (label: `false-negative`) | Per-issue triage |
| UX friction reports | GitHub Issues (label: `ux`) | Per-issue triage |
| Uninstall rate | Marketplace dashboard (if available) | Weekly |

## Triage Policy

### Priority Order
1. **Security issues**: Fix immediately, patch release same day if possible
2. **False negatives** (missed secrets): High priority — secrets leaking defeats the product
3. **False positives** (over-masking): Medium priority — annoying but safe; fix via pattern tuning or allowlist additions
4. **UX friction**: Lower priority unless it causes users to disable SecretShields entirely

### Response Targets
- Security: Acknowledge within 24 hours, patch within 72 hours
- False negatives: Acknowledge within 48 hours, fix in next patch
- False positives: Acknowledge within 48 hours, batch into weekly patch
- UX friction: Acknowledge within 1 week, evaluate for next minor release

### Fix Strategy
1. **Patterns/allowlists first**: Most detection issues are solvable by tuning regex patterns or adding allowlist entries. These are low-risk changes.
2. **Entropy thresholds second**: If a pattern class has too many false positives, tighten the entropy threshold.
3. **UX changes last**: Config defaults, notification behavior, and poll timing changes affect all users — validate carefully.

## Stop Criteria

Pause beta distribution and investigate if any of these occur:

| Condition | Action |
|-----------|--------|
| Security vulnerability reported in SecretShields itself | Unpublish immediately, fix, re-validate, re-publish |
| >30% of issues are the same false positive | Hotfix the pattern, patch release |
| Star rating drops below 2.5 (with >10 ratings) | Investigate top complaints, consider pulling listing |
| Extension causes VS Code/Cursor crash or hang | Unpublish, debug, re-publish |
| Data loss reported (clipboard corruption) | Unpublish immediately, root cause analysis |

## Patch Cadence

| Phase | Duration | Cadence |
|-------|----------|---------|
| Beta launch (week 1-2) | 2 weeks | Patch on demand (daily if needed) |
| Beta stabilization (week 3-4) | 2 weeks | Weekly patch batches |
| Post-beta (week 5+) | Ongoing | Biweekly patches, monthly minor releases |

### Patch Release Checklist
1. Collect issues fixed since last release
2. Update `CHANGELOG.md`
3. Bump version: `npm version patch`
4. Run full validation: `npm run lint && npm test && npm run build && npx vsce package --no-dependencies`
5. Execute `docs/public-beta-checklist.md` in VS Code + Cursor
6. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`
7. Verify publish succeeded on both marketplaces
8. Close resolved GitHub issues

## Graduation Criteria (Beta → Stable)

Move from beta to stable (v1.0.0) when:
- [ ] 100+ active installs with no critical issues for 2+ weeks
- [ ] False positive rate < 5% of reported issues
- [ ] No unresolved false negatives for major providers (AWS, GitHub, OpenAI, Anthropic)
- [ ] Star rating >= 4.0 (with >20 ratings)
- [ ] All stop criteria have been clear for 4+ weeks
