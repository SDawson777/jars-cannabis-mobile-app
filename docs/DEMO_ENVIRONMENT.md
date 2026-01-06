# Demo Environment

This document is the single source of truth for the Nimbus Cannabis OS **demo environment**: endpoints, dataset, demo logins, how to reseed, and how to produce demo store builds.

## URLs

### Mobile API (and CMS)

The mobile app uses `EXPO_PUBLIC_API_URL` as the single origin for:

- **Core API**: `${EXPO_PUBLIC_API_URL}/api/v1/*`
- **CMS endpoints**: same origin (see [src/utils/cmsConfig.ts](../src/utils/cmsConfig.ts))

**Hosted demo backend (Railway)**

- Base origin: `https://nimbus-cannabis-mobile-production.up.railway.app`
- API base (v1): `https://nimbus-cannabis-mobile-production.up.railway.app/api/v1`

**Local demo backend (Docker)**

- Base origin: `http://localhost:3000`
- API base (v1): `http://localhost:3000/api/v1`

### Admin

There is no separate “admin web UI” shipped in this repo.

- Admin functionality is exposed via protected API routes under `${EXPO_PUBLIC_API_URL}/api/v1/admin/*`.
- See the admin JWT helper docs in [README.md](../README.md) (search for `make-admin-jwt`).

## Dataset name

### Local Docker dataset

- **Postgres DB name**: `jars_dev` (default in [docker-compose.yml](../docker-compose.yml))
- **Demo dataset**: seeded by `backend/prisma/seed-demo.ts` (run via `npm --prefix backend run seed:demo`).

### Hosted demo dataset

- Hosted demo typically runs the same demo seed concept (demo users/products/stores) but is managed by the deployment platform.

## Demo user credentials

There are two credential sets depending on which backend you’re pointing the app at.

### Hosted demo backend (Railway)

From the in-app Demo Backend Helper (Settings):

- `buyer@demo.com` / `password123`
- `admin@demo.com` / `admin123`
- `manager@demo.com` / `manager123`

### Local Docker demo seed

From [DEPLOYMENT.md](../DEPLOYMENT.md):

- `demo+admin@example.com` / `demo123`
- `demo+user@example.com` / `demo123`
- `demo+sarah@example.com` / `demo123`
- `demo+mike@example.com` / `demo123`
- `demo+jessica@example.com` / `demo123`

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
- `EXPO_PUBLIC_API_URL=https://nimbus-cannabis-mobile-production.up.railway.app`

### iOS: TestFlight build (demo)

1. Build:

```bash
eas build --platform ios --profile demo
```

2. Submit to TestFlight:

```bash
eas submit --platform ios --profile demo --latest
```

Prereqs:

- App Store Connect app set up (bundle id matches), and `eas submit` credentials configured.
- Update `submit.demo.ios.ascAppId` in [eas.json](../eas.json) (currently `REPLACE_AT_HANDOFF`).

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

### iOS (TestFlight)

- Install Apple’s **TestFlight** app.
- Accept the TestFlight invite link (see “Links” below).
- Install the Nimbus demo build.
- Open the app and sign in using the “Hosted demo backend” credentials above.

### Android (Internal testing)

- Join the internal test via the Play Console invite link (see “Links” below).
- Install the Nimbus demo build from Google Play.
- Open the app and sign in using the “Hosted demo backend” credentials above.

## Links

- TestFlight invite link: **TBD**
- Google Play internal test link: **TBD**

(After you generate these links in App Store Connect / Play Console, paste them here.)
