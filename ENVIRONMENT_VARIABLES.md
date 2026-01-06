# ENVIRONMENT_VARIABLES.md

This file documents **what environment variables exist** and **where they are stored**, per environment.

Rules:

- Do **not** commit secrets to git.
- Use `EXPO_PUBLIC_` only for values that are safe to bundle into the mobile app.

## Demo environment

### Mobile (Expo / EAS)

**Non-secret (embedded into demo builds)**

- `EXPO_PUBLIC_APP_ENV=demo`
- `EXPO_PUBLIC_API_URL=https://nimbus-api-demo.up.railway.app`

**Secrets (do not commit)**

- `EXPO_PUBLIC_SENTRY_DSN` → EAS project secrets
- `SENTRY_AUTH_TOKEN` → EAS project secrets (build-time only)

### Backend API (Railway)

**Secrets (do not commit)**

- `DATABASE_URL` → Railway environment variables
- `JWT_SECRET` → Railway environment variables
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` → Railway environment variables
- `OPENAI_API_KEY` → Railway environment variables
- Firebase server credentials (`FIREBASE_*`) → Railway environment variables

### Admin web (Vercel)

**Non-secret**

- `NEXT_PUBLIC_API_URL=https://nimbus-api-demo.up.railway.app` (or equivalent) → Vercel environment variables

**Secrets**

- Any service keys used by admin (if applicable) → Vercel environment variables

### CMS (Sanity)

- Sanity Studio: https://nimbus-cms.sanity.studio
- Dataset: `nimbus_demo`

Store Sanity tokens/keys in the appropriate platform secret manager (Sanity/Vercel/Railway), depending on where they’re used.

### Demo credentials

Store demo user credentials in **1Password / a secret manager**.

If you need a “public demo login” for prospects:

- Use a **non-privileged** demo user
- Rotate the password
- Keep access **read-only / scoped**

## Production environment

### Mobile (Expo / EAS)

**Non-secret (embedded into production builds)**

- `EXPO_PUBLIC_APP_ENV=production`
- `EXPO_PUBLIC_API_URL=<production API origin>`

**Secrets (do not commit)**

- `EXPO_PUBLIC_SENTRY_DSN` → EAS project secrets
- `SENTRY_AUTH_TOKEN` → EAS project secrets

### Backend / Admin / CMS

Store all production secrets in the platform secret managers:

- Railway (API)
- Vercel (Admin)
- Sanity (CMS)

## Local development

Use `.env` and `backend/.env` from their templates:

- `.env.example`
- `backend/.env.example`

These files are gitignored; do not commit them.
