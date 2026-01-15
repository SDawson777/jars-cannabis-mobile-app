# API Contract Overview

_All routes live under `/api/v1` unless otherwise noted. Full OpenAPI spec: `backend/openapi.yaml`._

## 1. Authentication & Request Headers

- **Auth scheme**: JWT bearer tokens (`Authorization: Bearer <token>`). Tokens issued by `/auth/login` or `/auth/register` and signed with `JWT_SECRET`. Firebase ID tokens are also accepted when verified server-side.
- **Correlation ID**: Send `x-correlation-id` to trace requests end-to-end. The backend will emit the same ID in logs and responses; if omitted, the server generates one.
- **Content type**: JSON requests must include `Content-Type: application/json`.
- **Timezone**: All timestamps are ISO8601 in UTC.

Example request:

```
GET /api/v1/orders?page=1 HTTP/1.1
Authorization: Bearer eyJhbGciOi...
x-correlation-id: 123e4567-e89b-12d3-a456-426614174000
```

## 2. Endpoint Catalog

### 2.1 Authentication & Session

| Method | Path             | Description                                                                  | Auth |
| ------ | ---------------- | ---------------------------------------------------------------------------- | ---- |
| POST   | `/auth/register` | Create an account (email, password, DOB, phone). Returns JWT + user profile. | No   |
| POST   | `/auth/login`    | Email/password login. Returns JWT + profile.                                 | No   |
| POST   | `/auth/token`    | Exchange Firebase ID token for backend JWT.                                  | No   |
| GET    | `/auth/me`       | Fetch current user info.                                                     | Yes  |
| POST   | `/auth/logout`   | Revoke refresh token + device push token.                                    | Yes  |

### 2.2 Profile, Preferences, & Notifications

| Method | Path                  | Description                                                                                |
| ------ | --------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/profile`            | Return profile, loyalty summary, notification opt-ins.                                     |
| PATCH  | `/profile`            | Update name, phone, DOB, marketing preferences. Validation via `middleware/validation.ts`. |
| POST   | `/profile/push-token` | Register Expo push token + device metadata; writes via `pushService`.                      |
| DELETE | `/profile/push-token` | Remove push token (logout/opt-out).                                                        |
| GET    | `/preferences`        | Retrieve strain, effect, and experience toggles.                                           |
| PUT    | `/preferences`        | Replace preference set (array of IDs).                                                     |

### 2.3 Catalog & Discovery

| Method | Path             | Description                                                              | Notes                                      |
| ------ | ---------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| GET    | `/products`      | Paginated product list with filters (`category`, `search`, price range). | Public. Cached in Redis (`products:list`). |
| GET    | `/products/{id}` | Product detail with variants and lab data.                               | Public.                                    |
| GET    | `/brands`        | List cannabis brands with hero assets.                                   | Public.                                    |
| GET    | `/stores`        | Nearby stores with hours, location, fulfillment methods.                 | `lat/lng` query optional.                  |
| GET    | `/stores/{id}`   | Store detail, menus, pickup windows.                                     |                                            |
| GET    | `/reviews`       | Product review feed for social proof.                                    | Public. Rate limited.                      |

### 2.4 Cart & Checkout

| Method | Path                   | Description                                                          |
| ------ | ---------------------- | -------------------------------------------------------------------- |
| GET    | `/cart`                | Fetch active cart (items, totals, taxes).                            |
| POST   | `/cart/items`          | Add or update cart item. Body: `{ productId, variantId, quantity }`. |
| DELETE | `/cart/items/{itemId}` | Remove line item.                                                    |
| POST   | `/cart/apply-coupon`   | Apply promo code; validates via backend and returns new totals.      |
| POST   | `/cart/fees/estimate`  | Estimate delivery + service fees for address/store combo.            |

### 2.5 Orders & Loyalty

| Method | Path                       | Description                                                                                     |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------- |
| GET    | `/orders`                  | Paginated order history (`page`, `pageSize`). Includes hydrated store data and status timeline. |
| POST   | `/orders`                  | Submit checkout request (cart snapshot, fulfillment method, payment metadata).                  |
| GET    | `/orders/{id}`             | Fetch single order with tracking events.                                                        |
| GET    | `/awards`                  | Loyalty catalog with redemption thresholds.                                                     |
| POST   | `/awards/{awardId}/redeem` | Redeem reward for logged-in user; enforces idempotency.                                         |
| GET    | `/loyalty`                 | Returns points balance, tier, next milestone.                                                   |

### 2.6 Concierge, Personalization & AI

| Method | Path                       | Description                                                                                                                 |
| ------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/concierge/chat`          | Send user prompt; backend proxies to OpenAI with timeout/backoff. Response includes `isFallback` when degradation kicks in. |
| GET    | `/personalization/home`    | Personalized product shelf configuration.                                                                                   |
| POST   | `/personalization/journal` | Save journal entry; request uses `{ mood, notes, products[] }`.                                                             |
| GET    | `/journal/entries`         | List journal history with pagination.                                                                                       |
| GET    | `/recommendations`         | Weather + preference-based SKU list, hydrated from Redis cache.                                                             |
| GET    | `/weather/current`         | Returns localized temperature + strain suggestions (public but throttled).                                                  |

### 2.7 Payments & Webhooks

| Method | Path                    | Description                                                                                                      |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST   | `/stripe/payment-sheet` | Creates ephemeral key + PaymentIntent client secret for mobile sheet. Requires Stripe keys + authenticated user. |
| GET    | `/payment-methods`      | List saved cards (brand, last4, expiry, isDefault).                                                              |
| POST   | `/payment-methods`      | Save tokenized card metadata.                                                                                    |
| PATCH  | `/payment-methods/{id}` | Update default flag.                                                                                             |
| DELETE | `/payment-methods/{id}` | Remove payment method.                                                                                           |
| POST   | `/stripe/webhook`       | Receives Stripe events; verifies signature via `STRIPE_WEBHOOK_SECRET`, updates orders accordingly.              |

### 2.8 Content, Community & Analytics

| Method | Path                    | Description                                             |
| ------ | ----------------------- | ------------------------------------------------------- |
| GET    | `/content/legal`        | Terms, privacy, and compliance copy blocks.             |
| GET    | `/content/filters`      | Filter metadata for discovery screens.                  |
| GET    | `/content/products`     | CMS-managed product content, badges, and featured text. |
| GET    | `/content/copy`         | Retrieve copy blocks by context (see below).            |
| GET    | `/community/posts`      | Social/community feed (placeholder).                    |
| POST   | `/analytics/events`     | Batched analytics events forwarded to warehouse.        |

#### Copy Contexts (`/content/copy?context=<context>`)

| Context             | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `onboarding`        | Welcome screens, first-time user tooltips, preference wizard copy.          |
| `emptyStates`       | Empty cart, no orders, no favorites, no journal entries messaging.          |
| `awards`            | Loyalty program descriptions, tier explanations, reward redemption text.    |
| `accessibility`     | Screen reader hints, alt text defaults, reduced motion explanations.        |
| `dataTransparency`  | Data collection notices, privacy explanations, consent copy.                |

#### Analytics Headers

When posting to `/analytics/events`, include these headers for authenticated analytics:

| Header                  | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `X-Analytics-Key`       | Public analytics API key (from `EXPO_PUBLIC_ANALYTICS_KEY`).     |
| `X-Analytics-Signature` | HMAC-SHA256 of request body using `ANALYTICS_SIGNING_SECRET`.    |

### 2.9 Utility & Internal

| Method | Path                  | Description                                                      |
| ------ | --------------------- | ---------------------------------------------------------------- |
| GET    | `/health`             | Lightweight liveness probe.                                      |
| GET    | `/ready`              | Checks DB + Redis connectivity before admitting traffic.         |
| POST   | `/phase4/cache/prime` | Internal-only route to prewarm caches; protected by admin token. |
| POST   | `/qa/reset`           | Resets seed data in staging (QA automation).                     |

## 3. Request & Response Patterns

### Pagination

- Query params: `page` (default 1) and `limit` (default 20, max 100 unless noted).
- Responses include `pagination: { page, limit, total, pages, nextPage }`.

### Errors

- Global error format (`backend/src/middleware/errorHandler.ts`):
  ```json
  {
    "error": "validation_error",
    "details": {
      "field": "email",
      "message": "Email is required"
    },
    "correlationId": "123e..."
  }
  ```
- Common codes: `400 validation_error`, `401 unauthorized`, `403 forbidden`, `404 not_found`, `409 conflict`, `422 unprocessable_entity`, `429 rate_limited`, `500 internal_error`.

### Rate Limits

- Global default: 100 requests / 15 minutes per IP.
- Specific routes use stricter buckets (configured in `backend/src/middleware/rateLimit.ts`):
  - `/auth/*`: 20/minute.
  - `/concierge/chat`: 5/minute per user.
  - `/weather/*`: 10/minute per IP.
  - `/stripe/payment-sheet`: 3/minute per user.
    429 response includes `Retry-After` header.

### Idempotency & Concurrency

- `orders` and `awards/redeem` accept `Idempotency-Key` header to safely retry network failures.
- Stripe webhook handler guards double-processing via event IDs stored in Redis.

## 4. Contracts by Domain

| Domain       | Key Schemas                                    | Notes                                                                            |
| ------------ | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| User/Profile | `User`, `Profile`, `NotificationPreferences`   | DOB and phone required for compliance; `marketingOptIn` boolean default `false`. |
| Catalog      | `Product`, `Brand`, `Store`, `Review`          | `Product` includes cannabinoid profile and `variants[]` with inventory counts.   |
| Cart/Orders  | `Cart`, `CartItem`, `Order`, `DeliveryAddress` | Monetary fields are floats in USD; rounding handled server-side.                 |
| Loyalty      | `LoyaltyStatus`, `Award`, `Redemption`         | All balances expressed in integer points.                                        |
| Concierge    | `ConciergeMessage`, `ConciergeResponse`        | `isFallback` boolean, `latencyMs` metric for monitoring.                         |

## 5. Versioning & Change Management

- Contract source of truth: `backend/openapi.yaml`. Update this file plus `API_CONTRACT.md` when introducing breaking changes.
- Backward-incompatible changes require:
  1. New `x-api-version` header gate or new endpoint path.
  2. Mobile client release that consumes new contract.
  3. Deprecation notice added to this document and release notes.
- Minor additions (new fields, optional params) must be backwards compatible and reflected in the schema with `nullable` or default values.

## 6. Environment Variables Reference

The following environment variables are required for full API functionality:

| Variable                      | Description                                                  | Required |
| ----------------------------- | ------------------------------------------------------------ | -------- |
| `DATABASE_URL`                | PostgreSQL connection string.                                | Yes      |
| `JWT_SECRET`                  | Secret for signing/verifying JWT tokens.                     | Yes      |
| `STRIPE_SECRET_KEY`           | Stripe API secret key for payments.                          | Yes      |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook signature verification.                       | Yes      |
| `OPENAI_API_KEY`              | OpenAI API key for concierge AI.                             | No       |
| `REDIS_URL`                   | Redis connection for caching and rate limiting.              | No       |
| `EXPO_PUBLIC_API_URL`         | Base URL for mobile client API calls.                        | Yes      |
| `EXPO_PUBLIC_ANALYTICS_KEY`   | Public analytics key for mobile client.                      | No       |
| `ANALYTICS_SIGNING_SECRET`    | HMAC secret for analytics event signatures.                  | No       |
| `MAPBOX_ACCESS_TOKEN`         | Mapbox API token for geolocation features.                   | No       |
| `FIREBASE_PROJECT_ID`         | Firebase project for push notifications.                     | No       |
| `SENTRY_DSN`                  | Sentry DSN for error tracking.                               | No       |

See `ENVIRONMENT_VARIABLES.md` for complete documentation.

## 7. Personalization Guidance

### Personalization Engine Overview

The personalization system uses multiple signals to tailor the user experience:

1. **Preference Signals**: Stored in `/preferences` - strain types, effects, consumption methods.
2. **Behavioral Signals**: Order history, browse patterns, journal entries.
3. **Contextual Signals**: Time of day, weather, location, device type.
4. **Social Signals**: Community engagement, reviews, follows.

### Key Personalization Endpoints

| Endpoint                     | Signals Used                              | Output                                     |
| ---------------------------- | ----------------------------------------- | ------------------------------------------ |
| `/personalization/home`      | Preferences + orders + time               | Personalized home screen product shelves   |
| `/recommendations`           | Weather + preferences + journal           | Strain recommendations with explanations   |
| `/ai/recommendations`        | All signals + AI analysis                 | Deep personalized suggestions with reasons |
| `/dynamic-home/layout`       | User tier + behavior + experiments        | Dynamic home screen layout and sections    |

### Personalization Response Structure

All personalization endpoints return:
- `items[]`: Recommended products/content
- `reasoning`: Why each item was selected (for transparency)
- `confidence`: 0-1 score indicating recommendation strength
- `signals`: Which user signals influenced the result
- `fallback`: Boolean indicating if generic results were used

### A/B Testing Integration

Personalization supports experiment assignment via:
- `X-Experiment-Bucket` header (if assigned)
- Query param `?experiment=<id>` for QA
- Automatic assignment stored in user profile

For questions or clarifications, contact `api-support@jars.app` or the backend team listed in `PRODUCTION_READINESS.md`.
