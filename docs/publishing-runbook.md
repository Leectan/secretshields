# Publishing Runbook

Step-by-step guide for publishing SecretShields to VS Code Marketplace and OpenVSX. A new maintainer should be able to ship a release by following this doc.

## Prerequisites

- Node.js 20+
- npm access to this repo
- GitHub repo admin access (for secrets)

## 1. Create VS Code Marketplace Publisher

1. Go to [Visual Studio Marketplace Management](https://marketplace.visualstudio.com/manage)
2. Sign in with a Microsoft account
3. Create a publisher with ID `secretshields` (must match `publisher` in `package.json`)
4. Create a Personal Access Token (PAT):
   - Go to [Azure DevOps](https://dev.azure.com/) → User Settings → Personal Access Tokens
   - Create a new token with scope: **Marketplace > Manage**
   - Set expiration to max (1 year); set a calendar reminder to rotate
   - Copy the token immediately (it won't be shown again)

## 2. Create OpenVSX Namespace

1. Go to [open-vsx.org](https://open-vsx.org/) and create an account
2. Create a namespace: `secretshields` (must match `publisher` in `package.json`)
3. Generate an access token from your account settings
4. Copy the token immediately

## 3. Configure GitHub Actions Secrets

1. Go to the GitHub repo → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `VSCE_PAT` — the VS Code Marketplace PAT from step 1
   - `OVSX_PAT` — the OpenVSX token from step 2

## 4. Pre-release Checks

Run these locally before tagging:

```bash
# Clean install
rm -rf node_modules && npm ci

# Full validation
npm run lint
npm test
npm run build
npx vsce package --no-dependencies

# Verify VSIX contents
npx vsce ls --no-dependencies
```

Ensure:
- All 61+ tests pass
- Lint is clean
- VSIX packages without errors
- No placeholder URLs remain in `package.json`
- Version in `package.json` matches intended release

## 5. Execute `docs/public-beta-checklist.md`

Before tagging, manually run through the beta checklist in both VS Code and Cursor. Do not skip this.

## 6. Tag and Release

```bash
# Ensure you're on the correct branch with all changes committed
git status

# Tag the release — version must match package.json (triggers publish workflow)
git tag vX.Y.Z
git push origin vX.Y.Z
```

The `publish.yml` workflow will automatically:
1. Install dependencies
2. Build and test
3. Package VSIX
4. Publish to VS Code Marketplace (using `VSCE_PAT`)
5. Publish to OpenVSX (using `OVSX_PAT`)

## 7. Post-publish Validation

1. **VS Code Marketplace**: Search "SecretShields" at [marketplace.visualstudio.com](https://marketplace.visualstudio.com/) — verify listing, icon, README render correctly
2. **OpenVSX**: Search "SecretShields" at [open-vsx.org](https://open-vsx.org/) — verify listing appears
3. **Install test (VS Code)**: Install from Marketplace, activate, copy a synthetic secret, verify masking works
4. **Install test (Cursor)**: Install from OpenVSX or VSIX, activate, verify same behavior

## 8. Publishing a Patch

```bash
# 1. Make your code changes
# 2. Update version in package.json
npm version patch   # or: npm version minor

# 3. Update CHANGELOG.md with new entry

# 4. Run pre-release checks (step 4 above)

# 5. Commit, tag, push
git add -A && git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

## Rollback / Unpublish

### VS Code Marketplace

```bash
# Unpublish a specific version (replace X.Y.Z with actual version)
npx vsce unpublish secretshields.secretshields@X.Y.Z

# Or unpublish entirely (removes listing)
npx vsce unpublish secretshields.secretshields
```

Alternatively, use the [Marketplace Management Portal](https://marketplace.visualstudio.com/manage) to unpublish or deprecate versions through the UI.

### OpenVSX

OpenVSX does not currently support unpublishing individual versions. Options:
- Publish a new patch version with the fix
- Contact OpenVSX maintainers via [GitHub issues](https://github.com/eclipse/openvsx/issues) for removal requests

### Emergency: Discontinue Extension

If a critical security issue is found:
1. Unpublish from both marketplaces immediately
2. Open a GitHub issue tagged `security` describing the problem (without disclosing exploit details)
3. Follow the responsible disclosure process in `SECURITY.md`
4. Fix, re-validate, and re-publish as a new version

## Secret Rotation Reminders

| Secret | Where | Rotation |
|--------|-------|----------|
| `VSCE_PAT` | GitHub Actions | Rotate annually (Azure DevOps PAT max expiry) |
| `OVSX_PAT` | GitHub Actions | Rotate per OpenVSX policy |

Set calendar reminders for PAT expiration dates.
