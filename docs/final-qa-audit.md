# Final QA Audit

## Summary
- Authentication now persists the server-issued JWT through the shared `AuthContext`, falls back to Firebase ID-token exchange, and wraps the entire navigation tree so protected requests automatically send an `Authorization` header.【F:src/hooks/useAuth.ts†L16-L98】【F:App.tsx†L202-L260】
- Core account flows (saved payment methods, address book, awards, cart, checkout, orders) call authenticated Express routes backed by Prisma, keeping mobile UI state in sync with real persistence and loyalty logic.【F:src/screens/SavedPaymentsScreen.tsx†L18-L117】【F:backend/src/routes/paymentMethods.ts†L7-L79】【F:src/screens/AddAddressScreen.tsx†L23-L162】【F:backend/src/routes/addresses.ts†L1-L102】【F:src/screens/AwardsScreen.tsx†L61-L200】【F:backend/src/routes/awardsApi.ts†L9-L68】【F:src/hooks/useCart.ts†L24-L220】【F:backend/src/routes/cart.ts†L7-L190】【F:src/screens/CheckoutScreen.tsx†L182-L260】【F:backend/src/routes/orders.ts†L7-L159】
- Home, content, community, personalization, data-transparency, and accessibility experiences are served by dedicated routers, with Firestore-backed fallbacks for phase-4 endpoints so demo environments remain functional while production can swap in real credentials.【F:src/screens/HomeScreen.tsx†L23-L121】【F:backend/src/routes/content.ts†L1-L120】【F:src/screens/CommunityGardenScreen.tsx†L14-L90】【F:backend/src/routes/personalization.ts†L1-L47】【F:backend/src/routes/phase4.ts†L4-L161】

## Functional coverage
### Authentication & profile
- Email/password login hits `/auth/login`, falls back to Firebase ID-token exchange, and stores the JWT in secure storage for subsequent requests.【F:src/hooks/useAuth.ts†L19-L76】
- `AuthProvider` loads persisted tokens, enforces biometric re-authentication when enabled, and supplies profile data fetched from `/profile`.【F:App.tsx†L202-L260】【F:src/context/AuthContext.tsx†L34-L96】

### Payments & addresses
- Saved payment screens query `/payment-methods`, while add/edit forms submit tokenized metadata that the backend validates, sets default flags, and persists via Prisma.【F:src/screens/SavedPaymentsScreen.tsx†L39-L117】【F:src/screens/AddPaymentScreen.tsx†L23-L118】【F:src/screens/EditPaymentScreen.tsx†L23-L118】【F:backend/src/routes/paymentMethods.ts†L7-L79】
- Address management forms share the backend schema (`fullName`, `phone`, `line1`, `city`, `state`, `zipCode`, `country`, `isDefault`), and the router normalizes responses, enforces ownership, and clears other defaults as needed.【F:src/screens/AddAddressScreen.tsx†L23-L162】【F:backend/src/routes/addresses.ts†L1-L102】

### Cart, checkout, and orders
- `useCart` hydrates the Zustand store from `/cart`, normalizes all mutation payloads, replays offline queue actions, and applies promos via `/cart/apply-coupon` while keeping AsyncStorage in sync.【F:src/hooks/useCart.ts†L24-L220】
- The Express cart router reconciles incoming item lists, recomputes totals, handles coupon validation, and exposes item-level CRUD for parity with the mobile UI.【F:backend/src/routes/cart.ts†L7-L190】
- Checkout validates delivery details, optionally launches the Stripe payment sheet, and calls `createOrder.mutate` so `/orders` can hydrate store/item metadata before clearing the cart.【F:src/screens/CheckoutScreen.tsx†L182-L260】【F:backend/src/routes/orders.ts†L7-L159】

### Loyalty, awards, and personalization
- `/loyalty/status` upserts the member record while the awards API returns loyalty progress, reward catalog entries, and enforces point deductions during redemption.【F:backend/src/routes/loyalty.ts†L7-L18】【F:backend/src/routes/awardsApi.ts†L9-L68】【F:src/screens/AwardsScreen.tsx†L61-L200】
- Personalized home rails and weather-aware recommendations load from backend routers that either query Prisma or fall back to curated fixtures when a database is unavailable.【F:backend/src/routes/personalization.ts†L1-L47】【F:backend/src/routes/recommendations.ts†L9-L92】【F:src/screens/HomeScreen.tsx†L23-L121】

### Phase-4 utilities
- Data export, accessibility, and ethical-AI endpoints rely on Firestore via the bootstrap helper, with stubbed fallbacks so the flows continue working in demo/test environments.【F:backend/src/routes/phase4.ts†L4-L161】

### Monitoring & smoke tests
- The Postman smoke suite exercises live health, product, community, article, and loyalty endpoints for deployment validation.【F:qa/collection.json†L1-L32】

## Outstanding issues
- Dependency audit still reports four high-severity vulnerabilities (`@expo/webpack-config`, `expo-pwa`, `@expo/image-utils`, `semver`) plus a moderate `webpack-dev-server` advisory; upgrading the Expo web toolchain (or removing it if unused) remains necessary before release.【F:final-audit.json†L1-L118】
- Phase-4 routes depend on Firebase Admin credentials; production deployments must supply the service account described in `AGENT.md` to avoid falling back to the in-memory stubs for exports and accessibility settings.【F:backend/src/routes/phase4.ts†L4-L161】【F:AGENT.md†L1-L34】

## Recommendations
1. Plan the Expo SDK/web toolchain upgrade to clear the outstanding vulnerabilities and regenerate the shrinkwrap once versions are aligned.【F:final-audit.json†L1-L118】
2. Ensure production environments provide `FIREBASE_SERVICE_ACCOUNT_BASE64`/related keys so data exports and accessibility preferences persist outside the stub implementation.【F:backend/src/routes/phase4.ts†L4-L161】
3. Document database seeding expectations (stores, products, loyalty catalog) so the hydrated experiences shown in this audit remain available in staging and production.
