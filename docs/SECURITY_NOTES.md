# Security Notes

_Last reviewed: January 2026_

This document summarizes the current security posture of the **Nimbus Cannabis OS Mobile** repo, with an emphasis on: Firebase rules, JWT-based auth, crash/error reporting, encryption, and key rotation.

## Scope

- **Mobile app (Expo / React Native)**: client auth, data handling, secure storage, crash reporting
- **Backend API (Express / Prisma)**: authentication, authorization, secrets handling, request validation, error handling
- **Firebase**: Firestore + Storage rules and admin credential handling

## Firebase

### Firestore rules

Current Firestore rules are defined in `firestore.rules`.

- `match /users/{uid}`
  - `read, update` allowed only for the authenticated user (`request.auth.uid == uid`)
  - `create` allowed for any authenticated user (`request.auth.uid != null`)
- `match /events/{id}`
  - `read` allowed publicly
- Default deny: `match /{document=**}` → `allow read: if false`

Security intent:

- User documents are **per-user isolated**.
- The rules default to **deny** for all other collections unless explicitly added.

### Storage rules

Current Storage rules are defined in `storage.rules` and are currently:

- `match /{allPaths=**}` → `allow read, write: if true`

This is **not production-safe**: it allows unauthenticated reads and writes to the entire bucket.

Recommended hardening before production:

- Restrict read/write to authenticated users and to specific paths.
- Consider per-user paths (e.g., `/users/{uid}/...`) and enforce `request.auth.uid == uid`.
- If public assets are required, allow read-only on a limited prefix.

### Firebase Admin credentials

Backend uses Firebase Admin (verified in `backend/src/routes/auth.ts`) to validate mobile `idToken` logins.

- Service account is supplied via `FIREBASE_SERVICE_ACCOUNT_BASE64`.
- Project is identified via `FIREBASE_PROJECT_ID`.

Do not commit any service account JSON. Rotate immediately if ever exposed.

## Authentication & Authorization

### Supported auth flows

Backend `/api/v1/auth/*` supports:

1. **Email + password**
   - Passwords are hashed using `bcryptjs` (cost factor `10` in current code).
   - A JWT is issued on successful login/register.

2. **Firebase ID token login**
   - Mobile can supply `idToken`.
   - Backend verifies with Firebase Admin (`admin.auth().verifyIdToken(idToken)`).
   - Backend maps the Firebase `uid` to a local Prisma `user` record.

### JWT usage

- JWT signing/verification uses `JWT_SECRET`.
- JWT payload includes `{ userId }`.
- Access token expiry is set to **1 hour** (`expiresIn: '1h'`).
- Auth uses `Authorization: Bearer <token>` headers.

### Key rotation for JWT

The backend currently expects a **single active** `JWT_SECRET`.

- Rotation is supported operationally (update secret in the platform + redeploy), but it is not “seamless”:
  - Existing tokens signed with the previous secret will fail verification after rotation.
- If seamless rotation is required, add support for multiple verification secrets (active + previous) and stagger deployments.

## Crash Reporting / Error Monitoring

## Health / Readiness / Monitoring

### API health probes

Backend exposes liveness + readiness probes intended for load balancers and platform health checks:

- `GET /api/v1/health` (liveness): returns `200` with `{ "ok": true }`
- `GET /api/v1/ready` (readiness): returns `200` when ready, otherwise `503` with `{ ready: false, checks: ... }`

There are also platform-friendly aliases:

- `GET /healthz` (same as `/api/v1/health`)
- `GET /ready` (same as `/api/v1/ready`)

These behaviors are covered by backend tests in `backend/tests/readiness.test.ts`.

### Verifying Sentry receives a test error

The backend initializes Sentry early (`backend/src/utils/sentry.ts`) and reports uncaught errors via the centralized error handler (`backend/src/middleware/errorHandler.ts`).

To validate ingestion end-to-end, the backend includes a **debug-only** diagnostics endpoint that sends a test exception to Sentry and returns the `eventId`:

1. Set environment variables:

- `SENTRY_DSN` to a valid DSN for your Sentry project
- `DEBUG_DIAG=1` (required to enable diagnostics routes)

2. Start the backend.
3. Trigger the event:

- `POST /api/v1/diag/sentry`

4. Confirm in Sentry by searching for the error message prefix `backend_sentry_test:` or by locating the returned `eventId`.

Important:

- Keep `DEBUG_DIAG=0` in production; diagnostics routes are intentionally disabled by default.

### Postgres backups

Operational backup + restore procedures are documented in `docs/postgres-backup.md`.

### Sentry

Sentry is present for both mobile and backend:

- **Mobile** uses `@sentry/react-native` (see `src/lib/logger.ts` and `src/components/ErrorBoundary.tsx`).
- **Backend** uses `@sentry/node` (initialized early in `backend/src/utils/sentry.ts` and reported in `backend/src/middleware/errorHandler.ts`).

Runtime behavior:

- If DSNs are missing, the backend logs a warning and continues.

### Firebase Crashlytics

Crashlytics is referenced as an operational option in production readiness docs, but there is **no Crashlytics SDK integration** in this repo by default (no `@react-native-firebase/crashlytics`).

If Crashlytics is added later, treat it as a second crash reporting sink and ensure:

- DSNs / API keys remain in secret managers.
- PII is not logged.

## Encryption & Sensitive Data Handling

### Transport encryption

- API traffic should be served over **HTTPS** in hosted environments.
- Local development is typically HTTP on `http://localhost:3000`.

### At-rest encryption

- Postgres encryption-at-rest depends on the hosting platform (e.g., Railway/Render managed disk encryption).
- Firebase stores are managed by Google and encrypt at rest.

### Mobile device storage

- Client-side sensitive values (tokens, session identifiers) should be stored using platform secure storage.
- This repo includes `expo-secure-store` and `react-native-keychain`; these store secrets in the OS keychain/keystore rather than AsyncStorage.

Do not place secrets into `EXPO_PUBLIC_*` variables.

## Operational Key Rotation

High-value secrets to rotate (recommended quarterly or on any incident):

- `JWT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

Rotation approach:

- Rotate in platform secret manager (Railway/Vercel/EAS/GitHub Actions).
- Redeploy backend.
- Validate using smoke tests (API + mobile login).

## Supply Chain / Dependency Controls

- Dependencies are pinned via lockfiles (`npm-shrinkwrap.json` at repo root and `backend/package-lock.json`).
- An SBOM is generated into `mobile-SBOM.json` for buyer diligence and audit support.
