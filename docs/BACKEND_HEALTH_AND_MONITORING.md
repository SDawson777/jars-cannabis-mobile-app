# Backend Health & Monitoring

This document describes how to monitor the Nimbus mobile backend in production and demo environments.

## Health endpoints

The backend exposes liveness and readiness probes.

### `GET /healthz` (liveness)

**Purpose:** “Is the process up and able to serve requests?”

**What it checks:**

- Returns `200` with a small JSON payload.
- Does **not** depend on the database.

**Use in uptime monitoring:**

- Configure external uptime monitors (Pingdom/StatusCake/UptimeRobot) to hit `GET /healthz`.
- Alert on non-`200` responses.

**Equivalent legacy endpoint:** `GET /api/v1/health`

### `GET /ready` (readiness)

**Purpose:** “Is the instance ready to receive real traffic?”

**What it checks (current behavior):**

- Database probe via Prisma (core readiness gate)
- Cache probe if `REDIS_URL`/`CACHE_URL` is configured (advisory)
- OpenAI key format check if `OPENAI_API_KEY` is configured (advisory)

**Responses:**

- `200` with `{ "ready": true, "checks": ... }` when the DB probe passes
- `503` with `{ "ready": false, "checks": ... }` when the DB probe fails

**Use in deployment / load balancers:**

- Configure container platforms / load balancers to use `GET /ready` as the readiness probe.
- During deployments, only send traffic to instances reporting ready.

**Equivalent legacy endpoint:** `GET /api/v1/ready`

### Other internal health routes

There is also a richer health router in the codebase (e.g. `GET /health/detailed`, `/metrics`). If these are mounted in your deployment, treat them as internal/admin-only endpoints.

## Sentry error monitoring (backend)

### Where Sentry is configured

Backend Sentry is configured in `backend/src/utils/sentry.ts`.

- DSN source: `process.env.SENTRY_DSN`
- Environment tag: `process.env.NODE_ENV` (defaults to `development`)

If `SENTRY_DSN` is not set, the backend will run but will log a warning and will not report errors to Sentry.

### How errors get reported

Unhandled errors are captured in `backend/src/middleware/errorHandler.ts` via `captureException(err)`.

### Trigger a test error

Recommended (safe) approach is to use the diagnostics route when enabled:

1. Ensure `SENTRY_DSN` is set in your deployment platform (Railway/Vercel/etc).
2. Temporarily enable diagnostics on the backend instance:
   - Set `DEBUG_DIAG=1`
3. Trigger the Sentry test capture:

```bash
curl -X POST "https://<your-backend-origin>/api/v1/diag/sentry"
```

This should emit a Sentry event without crashing the process.

## Related ops docs

- Mobile demo environment: [docs/DEMO_ENVIRONMENT.md](docs/DEMO_ENVIRONMENT.md)
- CMS ops docs (Sentry + monitoring): **replace with your CMS repo ops URL** → https://github.com/<ORG>/<CMS_REPO>/blob/main/docs/OPS.md
