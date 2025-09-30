# Production Readiness Follow‑Ups

This file tracks remaining or optional hardening tasks identified during the audit cycle. Items are grouped by domain; each has a brief intent and current status.

## Data Integrity & Commerce

- [x] Pricing integrity check on order creation (reject stale cart prices with 409 `pricing_changed`).
- [ ] Add test harness hook to mutate product/variant prices to exercise `pricing_changed` conflict path.
- [ ] Cart discount & tax structure normalization (explicit discount lines, fees, tax rounding audit).
- [ ] Promo / coupon validation hardening (single-use, stacking rules, expiration & scope enforcement).

## Loyalty & Awards

- [x] Catalog reward redemption basic (points deduction & history entry).
- [x] Idempotent rapid duplicate redemption guard (time-window duplicate suppression) – in progress with upcoming controller patch.
- [ ] True idempotency keys support (client-provided `idempotencyKey`) without schema migration (e.g. encoded into award metadata) or via new column.
- [ ] Concurrency-safe point deduction (transaction or conditional update) to prevent race double-spend under load.
- [ ] Tier recalculation policy (decide on downgrade behavior when points drop below threshold).

## Personalization / Preferences

- [ ] Strengthen personalization payload validation & schema versioning.
- [ ] Add audit trail for preference changes (who/when).

## Legal / CMS Content

- [ ] Add ETag + caching headers for legal / CMS pages.
- [ ] Implement content locale negotiation and fallback ordering.
- [ ] Integrity hash for legal documents surfaced in Privacy screen.

## Observability & Ops

- [ ] Introduce correlation/request ID middleware (propagate to logs & responses).
- [ ] Standardize structured error shape `{ error, details?, correlationId }` across all routes (orders/cart still mixed legacy messages).
- [ ] Add health & readiness endpoints (DB, cache, external APIs) with lightweight checks.
- [ ] Metrics emission (histograms for request latency, counters by error code) – evaluate OpenTelemetry.

## Payments / Stripe

- [ ] Persist Stripe payment method / intent IDs instead of transient placeholders.
- [ ] Webhook signature verification & idempotent webhook event processing.
- [ ] Refund / reversal flow outline & minimal endpoint scaffold.

## Mobile App Specific

- [ ] Suppress noisy analytics test logs (test logger shim or conditional no-op).
- [ ] Resolve `ForwardRef` warning in accessibility component test (adjust mock or forwardRef usage).
- [ ] Expo / RN version alignment decision (evaluate upgrade windows & regression test plan).
- [ ] Improve offline queue resilience (exponential backoff & jitter, max retry cap).

## Security / Auth

- [ ] Uniform auth error codes (currently mixed: `unauthorized`, raw strings, etc.).
- [ ] Rate limiting / abuse protection scaffold (per IP + token) for auth & order endpoints.
- [ ] Secret scanning / config validation extension (warn on default secrets in non-dev).

## Tooling & DevEx

- [ ] Postman collection refresh (reflect new error codes & pricing conflict scenarios).
- [ ] Script to seed representative loyalty states (Bronze → Gold) for manual QA.
- [ ] Add `npm run test:backend` alias for faster backend-only iteration.

## Accessibility & UX

- [ ] Expand automated a11y smoke checks for critical flows (checkout, profile, loyalty).
- [ ] Dynamic font scaling snapshot tests for large text mode.

## Internationalization

- [ ] Timezone & locale-aware date formatting for orders & loyalty history.
- [ ] Placeholder translation extraction audit (ensure no hard-coded strings remain in new components).

## Performance

- [ ] Server-side response compression (gzip/br) for large JSON payloads.
- [ ] Evaluate caching layer for product catalog & store info (stale-while-revalidate pattern).

## Documentation

- [ ] Public API error code catalog (Markdown + OpenAPI examples).
- [ ] Add architecture decision records for pricing integrity & loyalty idempotency strategies.

---

Legend: `[x]` complete, `[ ]` pending. This list will evolve as additional gaps are surfaced.
