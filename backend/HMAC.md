# HMAC Validation for Analytics & Webhooks

This project includes HMAC validation middleware (`backend/src/middleware/hmac.ts`) to protect certain endpoints (analytics event ingestion, webhooks).

Key points:

- `validateHMAC(configKey)` checks a signature header (configurable per key) using a shared secret.
- `analytics` config uses `ANALYTICS_HMAC_SECRET` (falls back to `JWT_SECRET` if not set).
- `stripe` config uses `STRIPE_WEBHOOK_SECRET`.

How to enable safely:

1. Add required env vars in your deployment environment (do NOT include them in client-side `.env` files):
   - `ANALYTICS_HMAC_SECRET` (high-entropy secret for analytics ingestion)
   - `STRIPE_WEBHOOK_SECRET` (if using Stripe webhooks)

2. The analytics route is using `express.raw()` to capture raw bytes for signature verification. Ensure your reverse proxy or load balancer does not alter request bodies.

3. If adding HMAC to other routes, prefer route-level `express.raw({ type: 'application/json' })` middleware followed by `validateHMAC()` to avoid global changes to body parsing.

4. Tests: provide a valid signature header when testing these endpoints. The middleware accepts raw JSON bytes or `req.rawBody` if previously set.

Security notes:

- Keep HMAC secrets out of VCS and client builds.
- Rotate secrets periodically and provide a mechanism to accept previous secrets for smooth rotation (not implemented here).

Example (already applied): analytics route uses `express.raw` and `validateHMAC('analytics')`.
