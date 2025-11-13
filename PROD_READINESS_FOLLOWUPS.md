# Post-Readiness Extra Tasks & Optional Enhancements

This document tracks optional tasks deferred from the readiness phase. Core readiness is COMPLETE as of 2025-09-27. These are now extra enhancements for improved performance, observability, and polish.

## Core Readiness Complete (2025-09-27)

- Auth token normalization (Firebase ID -> server JWT).
- Payment methods validation & duplicate prevention.
- Addresses validation, normalization & duplicate prevention.
- Order creation pricing integrity (authoritative price check, structured errors).
- Reward redemption: points balance enforcement, duplicate rapid redemption guard, structured errors.
- Standardized error envelope with correlationId & code fields.
- Rate limiting on high-value endpoints (auth, orders, awards redemption).
- Observability baseline: correlation ID, structured logging, slow request detection.
- Operational readiness: health/readiness endpoints with DB probe.
- Cart offline queue immediate replay fix.

## Extra Tasks (Post-Readiness Enhancements)

1. Pricing & Fees
   - Add discount/coupon calculation path (persist applied coupon & discount lines on order).
   - Explicit tax strategy abstraction (configurable rate or per-store tax rules).
2. Loyalty / Awards
   - Tier recalculation service (separate worker or on-demand) with downgrade policy decision.
   - Points transaction ledger (earn/spend entries) for auditability.
   - Idempotency keys for redemption (client-provided) to strengthen duplicate guard beyond time window. (ORDERS DONE 2025-09-27; awards pending)
3. Stripe / Payments
   - Persist Stripe payment intent IDs on orders when card method selected.
   - Webhook handler for payment status -> order status transitions (CONFIRMED/READY).
4. Observability
   - Correlation ID middleware (inject `x-request-id`). (DONE 2025-09-26)
   - Structured logging alignment (json lines + log sampling for noisy categories). (DONE 2025-09-27)
   - Add userId auto-binding in request logger. (DONE 2025-09-27)
   - Slow request warning threshold (e.g. >750ms). (DONE 2025-09-27)
5. Content / CMS
   - ETag or Last-Modified handling for legal/faq endpoints.
   - Caching layer with stale-while-revalidate for public content.
6. Security & Compliance
   - Rate limiting (IP + token) on sensitive routes (auth DONE; redemption/order create DONE 2025-09-27).
   - Helmet style headers or equivalent for backend responses. (Helmet already applied in app.ts – CSP hardening DONE 2025-09-27)
7. Operational
   - Add health/ready endpoints with dependency checks (db, cache). (READINESS DB probe added 2025-09-27)
   - Graceful shutdown signals for backend (drain active requests). (DONE existing implementation verified 2025-09-27)
   - Add cache / external API probes (Redis or placeholder) (DONE 2025-09-27)
8. Testing
   - Add integration test for 409 pricing_changed (extend test harness to allow product price mutation).
   - Add tests for contact validation error details (already partially covered).
9. Tech Debt / Cleanup
   - Silence analytics log noise in test env via logger transport stub. (DONE 2025-09-27)
   - Remove unused enums/types in client not under test.
10. Performance

- Batch product/variant lookups in order pricing (currently N queries in a loop). (DONE 2025-09-27)
- Add simple in-memory LRU for product price lookups if high volume. (DONE 2025-09-27)

## Done (Date Sequenced)

2025-09-26: Pricing integrity & reward redemption guards.
2025-09-26: Follow-up doc created.
2025-09-26: Correlation ID + structured request logging baseline.
2025-09-27: Readiness endpoint, graceful shutdown verification, auth route rate limiting.
2025-09-27: Readiness DB probe, userId logger binding, slow request detection.
2025-09-27: Rate limiting extended to orders create & awards redeem; standardized error envelope (correlationId & code fields).
2025-09-27: Extra tasks: log sampling, analytics test noise suppression, batch product lookups + LRU cache, extended readiness probes, CSP headers, order idempotency keys.

---

Add new items below this line as they surface.
