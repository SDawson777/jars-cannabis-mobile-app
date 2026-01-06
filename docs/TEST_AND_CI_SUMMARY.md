# Test & CI Summary (Buyer Diligence)

**Repository:** `SDawson777/nimbus-cannabis-mobile`  
**Snapshot date:** 2026-01-06  
**Purpose:** Provide a CTO-friendly view of automated test posture, coverage, CI gates, and how to verify “green” status quickly.

## Current automated test status

### Mobile app (root Jest suite)

- **Test suites:** 70 total (70 passing)
- **Tests:** 427 total (427 passing)
- **CI command:** `npm run test:ci`

**Coverage (Jest/Istanbul from the current report):**

| Metric     | Covered / Total |      % |
| ---------- | --------------: | -----: |
| Statements |     1403 / 3779 | 37.12% |
| Branches   |      770 / 2296 | 33.53% |
| Functions  |      330 / 1056 | 31.25% |
| Lines      |     1326 / 3561 | 37.23% |

Coverage source: [coverage/coverage-final.json](../coverage/coverage-final.json) (Istanbul aggregate).

### Backend (separate Jest suite)

- **Test suites:** 25 total (25 passing)
- **Tests:** 195 total (195 passing)
- **CI command:** `npm --prefix backend run test:ci`

**Coverage (Jest/Istanbul from the current report):**

| Metric     | Covered / Total |      % |
| ---------- | --------------: | -----: |
| Statements |     1282 / 3270 | 39.20% |
| Branches   |      489 / 1469 | 33.28% |
| Functions  |       161 / 557 | 28.90% |
| Lines      |     1219 / 3068 | 39.73% |

Coverage source: [backend/coverage/coverage-final.json](../backend/coverage/coverage-final.json) (Istanbul aggregate).

## Test strategy (what’s covered and how)

### Jest unit tests (mobile)

- Located primarily under [src/**tests**/](../src/__tests__/) and [tests/](../tests/).
- Runs in a React/JSDOM-like environment with mocks for native modules.
- Coverage includes UI components, hooks, navigation behaviors, and client-side business logic.

### “Integration” tests (mobile)

- In this repository, “integration” generally means **app-level integration**: multiple modules/components exercised together under Jest.
- These do **not** require external infrastructure (e.g., real DB) and remain part of the default CI test gate.

### Backend tests

There are intentionally two lanes:

1. **Deterministic default lane (runs in CI)**

- Runs via `npm --prefix backend run test:ci`.
- Designed to avoid requiring a live database for the default CI path.

2. **Opt-in integration lane (higher fidelity)**

- Runs via `npm --prefix backend run test:integration`.
- Intended for environments where disposable infrastructure exists (e.g., ephemeral Postgres via Docker/CI service containers).

### Detox / E2E (mobile)

- Detox configuration: [e2e/detox.config.js](../e2e/detox.config.js)
- Typical flow:
  - Build: `npm run build:e2e:ios` or `npm run build:e2e:android`
  - Run: `npm run test:e2e:ios` or `npm run test:e2e:android`
- Detox is the highest-fidelity test type (full app in simulator/emulator) and is generally run in dedicated lanes due to runtime and infrastructure requirements.

### API smoke tests (Newman/Postman)

- Script: `npm run smoke`
- Workflow: PR-only (uploads a JUnit report artifact)
- Purpose: fast “is the API behaving at a high level” confidence check.

## CI / GitHub Actions

Workflows live under [.github/workflows/](../.github/workflows/).

### What runs on push

On pushes to `main` (and on pull requests), the repo runs a single canonical CI workflow. Additional workflows exist but are manual-only or informational.

### Canonical required check

- **Required check name:** `CI / test`
- **What it covers:** lockfile preflight + install + `typecheck` + `lint` + `format:check` + root + backend tests (with coverage artifacts)
- **Branch protection recommendation:** require only `CI / test` for merges to `main` (additional workflows may run, but are informational/non-blocking)

- **CI** ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) — runs on push/PR to `main` and `develop`
  - Gates: `typecheck`, `lint`, `format:check`
  - Tests:
    - Root `npm run test:ci` (with coverage)
    - Backend `npm --prefix backend run test:ci` (with coverage)
  - Artifacts:
    - uploads `coverage-root` (coverage directory)
    - uploads `coverage-backend` (backend/coverage directory)
  - Builds (after tests): Android/iOS preview build jobs run when secrets are available

- **Lint & Format Check** ([.github/workflows/lint-and-format.yml](../.github/workflows/lint-and-format.yml)) — manual-only
  - Optional: runs formatting/lint checks and lockfile sanity checks.

- **Mobile App CI** ([.github/workflows/mobile-app-ci.yml](../.github/workflows/mobile-app-ci.yml)) — manual-only
  - Optional: runs `lint`, `typecheck`, `npm test`, and `expo prebuild`.

- **Simple CI** ([.github/workflows/simple-ci.yml](../.github/workflows/simple-ci.yml)) — manual-only
  - Optional: a lightweight validation workflow.

### What runs on pull requests

- The canonical **CI** workflow runs on PRs.
- **Newman Smoke Tests** ([.github/workflows/newman-smoke.yml](../.github/workflows/newman-smoke.yml)) runs on PRs only.

### E2E workflow note

- **e2e-smoke** exists ([.github/workflows/e2e-smoke.yml](../.github/workflows/e2e-smoke.yml)) but its header appears malformed (missing a standard `on:` stanza). Treat as **not currently active** until corrected.

## How to view the latest green run

1. GitHub → repository → **Actions** tab.
2. Open **CI**.
3. Select the most recent run on `main` with a green check.
4. In that run:
   - Review job logs (lint/typecheck/tests).
   - Download coverage artifacts (`coverage-root`, `coverage-backend`) for auditability.

Optional (CLI): `gh run list --branch main --workflow CI`.

## Buyer CTO risk framing

- **Deterministic CI gates**: lint/typecheck/format + root + backend tests run on every push/PR.
- **Auditable outputs**: coverage is generated and uploaded as CI artifacts.
- **Separation of concerns**: unit/app-level integration tests run fast; higher-fidelity backend integration tests are available but opt-in to keep default CI stable.
- **Low review ambiguity**: a single canonical required check (`CI / test`) is intended to be the only branch-protection requirement.
