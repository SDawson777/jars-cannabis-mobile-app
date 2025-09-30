# Production Readiness Audit (2025-09-27)

## Executive summary
- The Expo shell now mounts every production provider (Stripe, store, loyalty, theme, settings, CMS preview, auth, and React Query) so secure endpoints are called with the backend-issued JWT across the full navigation stack.【F:App.tsx†L202-L320】【F:src/hooks/useAuth.ts†L1-L98】
- Core account data flows are live: stored payment methods, saved addresses, cart synchronization (including offline replay and promo codes), loyalty rewards, personalization, community content, and journal endpoints all round-trip through the authenticated Express routers backed by Prisma or fixture fallbacks.【F:backend/src/routes/paymentMethods.ts†L1-L79】【F:backend/src/routes/addresses.ts†L1-L159】【F:src/hooks/useCart.ts†L1-L220】【F:backend/src/routes/cart.ts†L1-L190】【F:src/screens/AwardsScreen.tsx†L1-L200】【F:backend/src/routes/awardsApi.ts†L1-L70】【F:backend/src/routes/personalization.ts†L1-L65】【F:backend/src/routes/content.ts†L1-L109】【F:backend/src/routes/community.ts†L1-L24】【F:backend/src/routes/journal.ts†L1-L56】
- CI and local automation cover linting, type-checking, Jest suites (mobile + backend), Detox smoke tests, asset validation, and smoke collections once the Newman script is regenerated.【F:package.json†L20-L52】【F:package.json†L62-L120】【F:setup.sh†L1-L120】【F:qa/collection.json†L1-L18】

## Feature verification snapshot
| Area | Mobile entry points | API / data sources | Notes |
| --- | --- | --- | --- |
| Authentication & session | `useAuth`, `AuthProvider` in `App.tsx` | `/auth/login`, `/auth/register`, `/auth/me` | Firebase ID tokens are exchanged for backend JWTs before storing tokens in secure storage.【F:App.tsx†L202-L320】【F:src/hooks/useAuth.ts†L1-L98】【F:backend/src/routes/auth.ts†L1-L97】 |
| Catalog & detail | `ShopScreen`, `ProductDetailScreen`, React Query hooks | `/products`, `/products/:id` | Listings return pagination envelopes; details expose variants and related products.【F:backend/src/routes/products.ts†L1-L198】【F:src/screens/ShopScreen.tsx†L1-L200】【F:src/screens/ProductDetailScreen.tsx†L1-L200】 |
| Cart & offline queue | `CartScreen`, `useCart`, `useOfflineCartQueue` | `/cart`, `/cart/update`, `/cart/apply-coupon` | Payloads normalize `productId/variantId`, mutations replay when connectivity returns, and the Zustand store mirrors backend totals.【F:src/screens/CartScreen.tsx†L1-L220】【F:src/hooks/useCart.ts†L1-L220】【F:backend/src/routes/cart.ts†L1-L190】 |
| Checkout & orders | `CheckoutScreen`, `OrderHistoryScreen` | `/orders`, `/orders/:id`, `/orders/:id/cancel` | Orders hydrate store and line-item metadata, recompute totals, and clear the cart after placement.【F:backend/src/routes/orders.ts†L1-L240】【F:src/screens/OrderHistoryScreen.tsx†L1-L200】 |
| Stored payments | `SavedPaymentsScreen`, Add/Edit forms | `/payment-methods` CRUD | Routes persist tokenized metadata, enforce ownership, and keep a single default card per user.【F:src/screens/SavedPaymentsScreen.tsx†L1-L200】【F:src/screens/AddPaymentScreen.tsx†L1-L200】【F:src/clients/paymentClient.ts†L1-L40】【F:backend/src/routes/paymentMethods.ts†L1-L79】 |
| Address book | `SavedAddressesScreen`, Add/Edit forms | `/addresses` CRUD | Prisma model stores full shipping payloads and default selection; UI consumes normalized responses.【F:src/screens/SavedAddressesScreen.tsx†L1-L200】【F:backend/src/routes/addresses.ts†L1-L159】 |
| Loyalty & awards | `AwardsScreen`, `useRedeemReward` | `/awards`, `/awards/:id/redeem`, `/loyalty/status` | Authenticated router returns loyalty progress, rewards catalog, and deducts points on redemption.【F:src/screens/AwardsScreen.tsx†L1-L200】【F:backend/src/routes/awardsApi.ts†L1-L70】【F:backend/src/controllers/awardsController.ts†L28-L110】 |
| Content & community | `EducationalGreenhouse`, `ArticleDetail`, `CommunityGarden` | `/content/articles`, `/content/articles/:slug`, `/community/posts` | Prisma-backed CMS pages with static fallbacks keep article and community feeds populated.【F:backend/src/routes/content.ts†L1-L109】【F:backend/src/routes/community.ts†L1-L24】 |
| Journal & insights | `MyJarsInsights`, `JournalEntry` | `/journal/entries`, `/journal/entries/:id` | API returns flat arrays, accepts `notes`, and enforces ownership checks.【F:backend/src/routes/journal.ts†L1-L56】【F:src/screens/MyJarsInsightsScreen.tsx†L1-L200】 |
| Personalization | `HomeScreen`, `useForYouToday` | `/personalization/home` | Endpoint serves DB-driven or fixture recommendations based on environment config.【F:backend/src/routes/personalization.ts†L1-L65】【F:src/screens/HomeScreen.tsx†L1-L200】 |

## Quality gates & automation
1. **Setup** – run `./setup.sh` to verify Node/npm, install root + backend dependencies (`npm ci --legacy-peer-deps`), and ensure Expo, Firebase, Prisma, TypeScript, Jest, and ESLint CLIs are available through `npx`.【F:setup.sh†L1-L120】
2. **Static analysis** – `npm run lint` and `npm run typecheck` guard formatting and TypeScript correctness; run `npm run format:ci` and `npm run check-assets` before tagging releases.【F:package.json†L20-L52】
3. **Unit & integration tests** – execute `npm test`, `npm --prefix backend test:ci`, and feature-specific suites such as `npm test -- src/__tests__/cart.integration.test.tsx` or `npm test -- src/__tests__/payments/*.test.tsx` to validate both layers.【F:package.json†L20-L52】【F:src/__tests__/cart.integration.test.tsx†L1-L200】【F:backend/tests/paymentMethods.test.ts†L1-L200】
4. **E2E smoke** – Detox profiles are defined for Android/iOS; `.github/workflows/e2e-smoke.yml` provisions the emulator, while `npm run test:e2e:android` runs locally if the Android SDK is installed.【F:package.json†L29-L34】【F:.github/workflows/e2e-smoke.yml†L1-L120】
5. **API smoke** – regenerate `qa/collection.json` from the OpenAPI spec so `npm run smoke` exercises `/api/v1` endpoints instead of the placeholder Gemini request.【F:package.json†L20-L52】【F:qa/collection.json†L1-L18】

## Deployment readiness
- **Railway / Render backend** – `Procfile` runs `npm run start:backend`, which builds Express via `npm run build:backend`. Ensure `backend/.env` supplies `DATABASE_URL`, Stripe, OpenAI, JWT secret, and Firebase credentials before deploying.【F:Procfile†L1-L1】【F:package.json†L20-L52】【F:backend/.env.example†L1-L14】
- **Vercel web shell** – `vercel.json` forces `npm install --legacy-peer-deps` and calls `vercel-build.sh`, which handles linting, Prisma generation, and `npm run build`. The rewrites proxy `/api/v1/*` traffic to the production API.【F:vercel.json†L1-L13】【F:vercel-build.sh†L1-L30】
- **Expo EAS builds** – `eas.json` defines development, preview, and production profiles with remote app versioning and preconfigured API base URL. Supply secrets (Stripe publishable key, Sentry DSN, Firebase web config, weather key) through EAS environment variables before `npx eas build --profile production --platform ios|android`.【F:eas.json†L1-L24】【F:.env.example†L1-L29】

## Environment & secrets checklist
Populate the following before shipping:
- Mobile `.env`: Sentry DSN, API base URL, optional CMS URL, Firebase web config, Stripe publishable key, and OpenWeather key.【F:.env.example†L1-L29】
- Backend `.env`: database URL, OpenAI key, Firebase service account (base64), Firebase project ID, JWT secret, Stripe secret, Sentry DSN, and Google Cloud service-account fields for export verification.【F:backend/.env.example†L1-L14】
- Configure Expo push credentials, Firebase Admin JSON, and Detox emulator caches in CI as described in `docs/buyer-setup.md` and `.github/workflows`.

## Outstanding release tasks
1. **Update the Postman/Newman collection** – replace `qa/collection.json` with real `/api/v1` smoke tests so `npm run smoke` validates the production contract.【F:qa/collection.json†L1-L18】
2. **Resolve remaining security advisories** – upgrade or remove the legacy Expo web toolchain (`@expo/webpack-config`, `expo-pwa`, transitive `semver`, `webpack-dev-server`) flagged in `final-audit.json`, or document the mitigation if web output stays disabled.【F:final-audit.json†L1-L120】
3. **Align Jest/Babel versions** – either downgrade `babel-jest` to 29.7 or upgrade Jest to 30+ after moving builds to Node 20 so Babel transform errors cannot resurface in CI.【F:package.json†L158-L197】
4. **Run the full validation matrix on the release branch** – `npm run lint`, `npm run typecheck`, `npm test`, `npm --prefix backend test:ci`, Detox smoke, `npm run build:backend`, Railway/Vercel deploys, and EAS production builds. Capture results in the release checklist.
5. **Monitor Sentry and OpenAI quotas post-launch** – concierge chat and error reporting degrade gracefully but should alert the team when credentials or quotas are missing.【F:App.tsx†L202-L320】【F:backend/src/routes/concierge.ts†L1-L120】

Once these follow-ups are complete, the codebase, pipelines, and deployment targets will be aligned for a master-grade production release.
