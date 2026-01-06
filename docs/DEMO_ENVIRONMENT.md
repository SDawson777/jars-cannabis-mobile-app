# Demo Environment

This document is the single source of truth for the Nimbus Cannabis OS **demo environment**: endpoints, dataset, how to reseed, and how to produce demo builds.

## URLs

### Mobile API (and CMS consumption)

The mobile app uses `EXPO_PUBLIC_API_URL` as the single origin for:

- **Core API**: `${EXPO_PUBLIC_API_URL}/api/v1/*`
- **CMS endpoints**: same origin (see [src/utils/cmsConfig.ts](../src/utils/cmsConfig.ts))

**Hosted demo backend (Railway)**

- Base origin: `https://nimbus-api-demo.up.railway.app`
- API base (v1): `https://nimbus-api-demo.up.railway.app/api/v1`

**Local demo backend (Docker)**

- Base origin: `http://localhost:3000`
- API base (v1): `http://localhost:3000/api/v1`

### Admin

There is no separate “admin web UI” shipped in this repo.

- Admin URL (hosted): `https://nimbus-admin-demo.vercel.app`

- Admin functionality is exposed via protected API routes under `${EXPO_PUBLIC_API_URL}/api/v1/admin/*`.
- See the admin JWT helper docs in [README.md](../README.md) (search for `make-admin-jwt`).

### CMS (authoring)

- Sanity Studio: `https://nimbus-cms.sanity.studio`

## Dataset name

### Local Docker dataset

- **Postgres DB name**: `jars_dev` (default in [docker-compose.yml](../docker-compose.yml))
- **Demo dataset**: seeded by `backend/prisma/seed-demo.ts` (run via `npm --prefix backend run seed:demo`).

### Hosted demo dataset

- Sanity dataset: `nimbus_demo`
- Hosted demo backend typically runs the same demo seed concept (demo users/products/stores) but is managed by the deployment platform.

## Demo user credentials

Do not commit demo credentials to git.

### DEMO ONLY (credentials)

Demo credentials are stored in **1Password / a secret manager** and are not committed to git.

- **Admin demo login**: request access to the “Nimbus Demo (Admin)” entry in your secret manager.
- **Consumer demo login**: request access to the “Nimbus Demo (Consumer)” entry in your secret manager.

If you need a “public demo login” for prospects:

- Use a **non-privileged** demo user.
- Rotate the password.
- Keep access **read-only / scoped**.

## How to rebuild the demo DB and reseed

### Local (recommended)

1. Start services:

```bash
docker-compose up -d
```

2. Reseed demo dataset:

```bash
docker-compose exec backend npm run seed:demo
```

Optional verbose:

```bash
docker-compose exec backend npm run seed:demo:verbose
```

If you want a truly clean rebuild:

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run seed:demo
```

### Hosted demo (QA reset)

There is a QA automation endpoint listed in [API_CONTRACT.md](../API_CONTRACT.md):

- `POST /api/v1/qa/reset`

Whether this is enabled/locked down in the hosted demo depends on deployment configuration.

## Demo mobile builds

Goal: produce **store-distribution** binaries that point at the demo environment.

### EAS profiles

The `demo` profile in [eas.json](../eas.json) is configured for store builds with:

- `EXPO_PUBLIC_APP_ENV=demo`
- `EXPO_PUBLIC_API_URL=https://nimbus-api-demo.up.railway.app`

### iOS: Demo via simulator build (recommended)

This path does **not** require Apple Developer credentials.

- Use the GitHub Actions CI job that produces an iOS Simulator artifact.
- Optional: if Appetize is configured, prefer the Appetize demo link for fastest prospect access.

### Android: Internal testing track build (demo)

1. Build:

```bash
eas build --platform android --profile demo
```

2. Submit to Google Play internal track:

```bash
eas submit --platform android --profile demo --latest
```

Prereqs:

- Google Play app set up.
- Service account JSON available at `./fastlane/google-service-account.json` (or update the path in [eas.json](../eas.json)).

## Store access instructions (short)

### iOS (Simulator)

- Download the `ios-simulator-build` artifact from GitHub Actions CI, or use the Appetize link if configured.
- Credentials are retrieved from 1Password / your secret manager.

### Android (Internal testing)

- Join the internal test via the Play Console invite link (see “Links” below).
- Install the Nimbus demo build from Google Play.
- Credentials are retrieved from 1Password / your secret manager.

## Links

- Google Play internal test link: **TBD**

(After you generate these links in App Store Connect / Play Console, paste them here.)

## Where demo builds live + how buyers request access

### iOS

Demo iOS builds are distributed as **simulator builds** from GitHub Actions (and optionally via Appetize).

Buyers should request:

- GitHub access to download CI artifacts, and/or
- The Appetize demo link (if enabled for the repo)

### Android

Demo Android builds are distributed via **Google Play Console → Testing → Internal testing**.

Buyers should request:

- Google Play internal testing access (tester email/group invite)
- The internal testing opt-in link (when generated)
