# Project Configuration

## Overview
Persistent project context referenced by both the planner (GPT 5.2) and implementer (Claude Code).

## Tech Stack
- **Platform**: VS Code Extension (compatible with VS Code + Cursor)
- **Language**: TypeScript (strict mode)
- **Bundler**: esbuild
- **Linting**: ESLint + Prettier
- **Testing**: Vitest (unit), @vscode/test-electron (integration)
- **Target**: `engines.vscode: ^1.85.0`

## Architecture Principles
- **Local-first**: No network calls for detection/masking/alerts. Privacy is a core product feature.
- **Mask-at-copytime**: Primary protection via clipboard monitoring. Any subsequent paste (including into AI chat) is masked by default.
- **No DOM injection**: VS Code extensions cannot inject JS into other extensions' chat webviews. True chat-input paste interception is not feasible.
- **No raw secret persistence**: Raw secrets exist briefly in-memory only (for deliberate restore with TTL). Persistent storage holds masked previews + metadata only.
- **Document paste APIs are conditional**: Treated as optional until verified stable for the targeted engine baseline; not relied on for MVP.
- **Rotation is manual (MVP)**: Open provider rotation pages; no auto-rotate via APIs.

## Coding Standards
- Follow existing patterns in the codebase
- Handle errors explicitly
- Write self-documenting code

## Changelog
<!-- Auto-populated after each implementation cycle -->
No changes yet.
