# Production Readiness Audit & Dependency Playbook

This document captures the outstanding gaps that block a production-grade release, the
framework/tooling dependencies that each area of the repository relies on, and the upgrade
strategy required to keep Expo, React Native, TypeScript, Jest, Babel, and backend tooling in
lockstep. It consolidates everything needed to stabilize the monorepo under the current 8 GB
installation limit that applies to developer laptops and ephemeral CI runners.

---

## 1. Dependency & Configuration Cross-Reference

| Area / Feature | Key Files | Runtime Dependencies | Build / Tooling Dependencies | Notes |
| --- | --- | --- | --- | --- |
| **Expo application shell** | `App.tsx`, `app.json`, `app.config.ts` | `expo@^50`, `react@18.3.1`, `react-native@0.81.4`, `@react-navigation/*`, `@tanstack/react-query` | `babel-preset-expo`, `@babel/preset-flow`, Metro 0.83 (pinned in `package.json` overrides) | Metro overrides ensure SDK 50 still runs on RN 0.81, but Expo 50 officially targets RN 0.73 – see upgrade plan below. |
| **Navigation & layout** | `src/navigation/*`, `src/components/*` | `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context` | Reanimated Babel plugin (`babel.config.js`), `tsconfig.json` path mapping | Reanimated requires Hermes + JSI; Expo SDK handles native binaries automatically. |
| **State management & persistence** | `stores/*`, `src/hooks/useCart.ts`, `src/hooks/useOfflineCartQueue.ts` | `zustand`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo` | Jest mocks in `tests/__mocks__`, `tsconfig.base.json` path aliases | Async queue relies on NetInfo + SecureStore; ensure mocks updated when deps change. |
| **API layer & auth** | `src/api/*`, `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts` | `axios`, `firebase`, `expo-secure-store`, `jwt-decode` | `tsconfig.eslint.json`, Jest moduleNameMapper entries for axios/Firebase mocks | Backend expects server-issued JWT; client currently mixes Firebase ID tokens – see production fixes. |
| **Payments** | `src/clients/paymentClient.ts`, `src/screens/payments/*`, backend `src/routes/paymentMethods.ts` | `@stripe/stripe-react-native`, backend `stripe` SDK, Prisma `PaymentMethod` model | EAS secrets (`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`), Jest Stripe mocks | Client still posts raw PAN data; backend route incomplete – see production fixes section. |
| **Addresses** | `src/screens/addresses/*`, backend `src/routes/addresses.ts` | (planned) Prisma `Address` model, `yup` validation | Jest form tests, backend Jest suite | Model/schema missing; UI currently mocks data – see production fixes. |
| **Awards / Loyalty** | `src/screens/AwardsScreen.tsx`, `src/api/hooks/useRedeemReward.ts`, backend `src/routes/awards*.ts` | Prisma `LoyaltyStatus`, Firestore fallbacks, React Query | Jest awards tests (`tests/awards.redeem.test.ts`), Firebase Admin SDK | Router currently unauthenticated and unmounted; controller expects different user shape. |
| **Journal & personalization** | `src/screens/journal/*`, `backend/src/routes/journal.ts`, `backend/src/routes/personalization.ts` | Prisma `JournalEntry`, Firebase Admin for exports, Bull queue | Jest journal tests, `firebase-tools` for emulator | Client expects flat arrays / `notes`; backend returns `{ items }` / `note`. |
| **Theme & weather** | `src/context/ThemeContext.tsx`, `WEATHER_IMPLEMENTATION_STATUS.md` | `expo-location`, `expo-task-manager`, OpenWeather REST API | `dotenv` (`EXPO_PUBLIC_OPENWEATHER_KEY`), Jest weather mocks | Works as long as env key supplied; include in Postman/env docs. |
| **Analytics & concierge** | `ANALYTICS_IMPLEMENTATION.md`, `src/screens/ConciergeChatScreen.tsx`, backend `src/routes/concierge.ts` | `firebase-analytics`, `openai`, `@sentry/react-native` / `@sentry/node` | `.env` secrets (`OPENAI_API_KEY`, `SENTRY_DSN`) | Ensure secrets configured in production envs. |
| **Testing (unit/integration)** | `jest.config.cjs`, `tests/*`, `src/__tests__/*` | `jest@29.7`, `@testing-library/react-native`, `jest-expo`, backend `jest.config.cjs` | Babel (`babel-jest`), ts-jest (for backend), custom mocks | `babel-jest@30.1.2` currently mismatched with Jest 29 – root cause of CI transform errors. |
| **Testing (Detox)** | `e2e/*`, `.github/workflows/e2e-smoke.yml` | `detox@20.41.3`, Android SDK (cmdline-tools r13+), Expo CLI | GitHub Actions caching, `setup-android-sdk` script | Cmdline-tools version must understand AVD schema v4; caching of system images recommended. |
| **Build tooling** | `setup.sh`, `vercel-build.sh`, `scripts/*.ts` | `npm` (>=9), `node` (18.x/20.x), `husky`, `lint-staged` | `setup.sh` runs `npm ci` root + backend, `npm run prisma-gen`, Firebase verification | Vercel runs `npm install --legacy-peer-deps` per `vercel.json`; ensure shrinkwraps committed. |
| **Backend API** | `backend/src/*`, `backend/prisma/schema.prisma` | `express@4/5`, `@prisma/client@6.16`, `firebase-admin@12`, `stripe@14` | `ts-node`, `tsc-alias`, `jest` backend config | `express@5` pulled into root (Expo) but backend uses Express 4 – keep independence via `npm --prefix backend`. |
| **Firebase Cloud Functions** | `functions/*` | `firebase-functions@6`, `firebase-admin` | Firebase CLI, emulator suite | Ensure Node version in `functions/package.json` stays aligned with deploy target. |

Supplemental references:
- Babel config: `babel.config.js` (Flow preset + reanimated plugin).
- TypeScript shared config: `tsconfig.base.json`, `tsconfig.json`, backend `backend/tsconfig.json`.
- ESLint monorepo config: `eslint.config.cjs` includes TypeScript ESLint 8 & React Native plugins.

---

## 2. Upgrade & Installation Strategy (Keeping Dependencies in Sync)

Because the repository mixes an Expo (React Native) app and an Express/Prisma backend, we need a
repeatable approach to bumping dependencies without exceeding the 8 GB memory ceiling or breaking
peer requirements. The matrix below lists the **current** versions and the **recommended target**
for the next alignment cycle, followed by the step-by-step process to perform safe upgrades.

| Stack Component | Current Version(s) | Recommended Target | Rationale & Compatibility Notes | Upgrade Steps |
| --- | --- | --- | --- | --- |
| Node.js / npm | Node 18.x / npm 10 (per `.nvmrc` & engines) | Node 20 LTS / npm 10 (lock to 20.18.x) | Expo SDK ≥51 supports Node 20; using the same runtime across local, CI, and Railway avoids build warnings. | Update `.nvmrc` + engines, run `nvm install 20.18`, regenerate shrinkwraps with `npm ci`, update CI runners (`actions/setup-node@v4`). |
| Expo SDK & React Native | `expo@50`, `react-native@0.81.4` (manual pin) | Align pair: either downgrade RN to 0.73.x (Expo 50) **or** upgrade to Expo SDK 52+ (React Native ≥0.76) | The current mix causes peer dependency conflicts on `npm install` (e.g., Vercel). Expo 52 (Dec 2024) ships with RN 0.76; Expo 53 targets RN 0.77. RN 0.81 requires Expo 54 (beta). | Choose path:<br/>• **Stabilize:** set `react-native@0.73.x`, run `npx expo install react-native@0.73.x`, regenerate shrinkwrap.<br/>• **Upgrade:** install Expo 52+ via `npx expo install expo@~52`, follow release notes (update `expo-modules`, `metro`, etc.), re-run `expo-doctor`. |
| React & React DOM | `react@18.3.1`, `react-dom@18.3.1` | Keep 18.3.x | Aligned with React Native 0.73+ and React DOM 18 (used only for web/Storybook). | No change; ensure `react-test-renderer` matches React version. |
| Jest & Babel | `jest@29.7`, `babel-jest@30.1.2`, `@babel/core@7.28.x` | Either stay on Jest 29 with `babel-jest@29` **or** upgrade Jest/Babel together (Jest 30 + Babel 7.26+) | The CI “transformSync” failure is due to `babel-jest` 30 requiring Jest 30. Aligning versions fixes import-stage crashes. | Option A: `npm install -D babel-jest@29.7.0 @babel/core@7.26.x`.<br/>Option B: upgrade to Jest 30 (requires Node 20), update config (`jest.config.cjs`, `jest-expo@51+`). |
| TypeScript | Root & backend `typescript@5.9.2`, `ts-jest@29.4.4` | Maintain 5.9.x until Expo upgrade complete | TS 5.9 works with RN 0.73+ and Prisma 6.16. Upgrade to TS 5.6+ requires updating `ts-jest` to 29.2+. | After Expo alignment, consider bump to TS 5.6+ and `ts-jest@29.2+` for incremental improvements. |
| Prisma | `prisma/@prisma/client@6.16.2` | Stay on 6.16.x | Matches Node 18/20; no action required. |
| Firebase Admin/Firebase JS | `firebase@12.3.0`, `firebase-admin@13.5.0` (root), backend `firebase-admin@12.7.0` | Align backend to Admin 13.5 (or root to 12.7) | Use a single admin SDK version to avoid emulator mismatches; ensures consistent JWT verification. | Run `npm install firebase-admin@13.5.0` inside backend, update `package-lock`s, run tests. |
| Stripe | Root `@stripe/stripe-react-native@0.53.1`, backend `stripe@14.25.0` | Keep versions | Compatible with Expo 50+, ensure `pod install` run after upgrade. |
| Detox / Android SDK | `detox@20.41.3`, emulator API 34 | Keep Detox 20, ensure cmdline-tools r14 | Install `cmdline-tools;latest` in CI, cache system images; run `sdkmanager --licenses` once (store acceptance output). |
| Husky / lint-staged | `husky@8`, `lint-staged@13` | Keep (no change) | Guard prepare script to skip in CI (already done). |

### Upgrade Workflow (Monorepo-aware, ≤8 GB RAM)

1. **Create a clean working tree**
   ```bash
   git clean -fdx
   nvm use 20.18 # once Node version decided
   npm ci --legacy-peer-deps # root install honoring shrinkwrap
   npm --prefix backend ci
   ```
2. **Align Expo/React Native** using `npx expo install` (ensures compatible versions of React Native
   and React Native modules, updates `expo-modules-autolinking`). Rebuild pods if using iOS locally.
3. **Update Jest/Babel** after Expo alignment. When downgrading `babel-jest`, delete `node_modules`
   and rerun `npm ci` to ensure the shrinkwrap captures the new versions.
4. **Regenerate lockfiles** – run `npm shrinkwrap` (root) and `npm --prefix backend install --package-lock-only`
   to regenerate `package-lock.json`, then `git commit`.
5. **Verify size & memory** – run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build:backend`
   locally. Ensure memory consumption stays under 8 GB by setting `NODE_OPTIONS=--max_old_space_size=4096`
   (already configured in test scripts).
6. **Update CI** – bump Node version in GitHub Actions, ensure caching keys include Expo SDK / Node version.

---

## 3. Final Production Fixes & Release Checklist

Below is the exhaustive list of functional gaps and CI blockers that must be closed before declaring
the app “master-grade” production ready. Items are grouped by feature area, with references to files
and the recommended fix. Completing these will also unblock the failing CI jobs.

### 3.1 Authentication & Authorization
- **Issue:** Mobile login stores Firebase ID tokens under `jwtToken`, but API clients look for
  `userToken` and the backend expects JWTs signed with `JWT_SECRET` (or verified Firebase tokens).
- **Fix:** Update `src/hooks/useAuth.ts` to exchange credentials with `/auth/login` and persist the
  backend token via `AuthContext`. Align `requireAuth` middleware to accept either backend JWTs or
  verified Firebase ID tokens.
- **Tests:** Extend `src/__tests__/profile.flow.test.tsx` and backend auth tests to cover the new
  exchange.

### 3.2 Payment Methods
- **Issue:** UI forms post raw PAN/CVV values and render a hard-coded list; backend lacks tokenized
  persistence and defaults.
- **Fix:** Implement `/payment-methods` routes (Prisma model, auth guard), accept tokenized metadata
  (`cardBrand`, `cardLast4`, `expiryMonth`, `expiryYear`, `isDefault`), and update React Query hooks
  to display the live list.
- **Tests:** Backend tests (`backend/tests/paymentMethods.test.ts`) already scaffolded—expand to cover
  create/update/delete. Update frontend tests under `src/__tests__/payments/`.

### 3.3 Address Book
- **Issue:** No Prisma model or router; UI uses mock data and mismatched payload keys (`state`
  vs. `zipCode`).
- **Fix:** Add `Address` model to Prisma schema, generate migration, implement `/addresses`
  CRUD with auth, and align forms to required fields (`fullName`, `line1`, `city`, `state`,
  `zipCode`, `country`, `phone`, `isDefault`).
- **Tests:** Backend `backend/tests/addresses.test.ts` (present) needs to target real Prisma model;
  update UI tests (`src/__tests__/addresses/*`).

### 3.4 Cart & Checkout
- **Issue:** Cart screen uses Zustand store while API updates go through React Query; offline queue
  saves `{ promo }` as `{ items: [] }`; `/cart/update` expects different payload shape; validation
  fetches `data.variants` vs. `data.product.variants`.
- **Fix:** Choose a single cart source (prefer the API + React Query) and update screen/hooks to share
  data. Ensure queued payloads include `productId`, `quantity`, `variantId`, `price`. Point promo
  submission at `/cart/apply-coupon` with `{ code }`. Update validation to inspect
  `res.data.product.variants`.
- **Tests:** Expand `tests/useCart.test.tsx`, `backend/tests/cart.update.test.ts`, and E2E smoke tests.

### 3.5 Orders
- **Issue:** API returns `{ items }` with raw Prisma fields; client expects `orders` array with
  `taxes`, `fees`, `store` display names.
- **Fix:** Normalize backend response (hydrate store names, rename fields) or adjust client to
  consume current structure. Ensure pagination surfaces `pagination.nextPage`.
- **Tests:** Update `src/__tests__/OrderHistoryScreen.test.tsx` and backend order tests.

### 3.6 Loyalty & Awards
- **Issue:** `/awards` router not mounted or authenticated; controller expects `req.user.id` while
  auth attaches `userId`; React Query posts to `/rewards/:id/redeem` instead of `/awards/:id/redeem`.
- **Fix:** Mount awards router, apply `requireAuth`, normalize user payload, and expose
  `/awards` + `/awards/:id/redeem`. Update client hooks accordingly.
- **Tests:** Re-run `tests/awards.redeem.test.ts`, add integration tests for unauthorized access.

### 3.7 Journal & Personalization
- **Issue:** `/journal/entries` returns `{ items }` while client expects array; POST body mismatch
  (`note` vs `notes`). `/personalization/home` route missing.
- **Fix:** Align payloads (server unwrap or client adapt); implement personalization route returning
  `ForYouTodayPayload` with fallback data.
- **Tests:** Update journal integration tests and personalization unit tests.

### 3.8 Legal & CMS Content
- **Issue:** Legal screens still render placeholder text instead of consuming `/content/legal`; content
  filters rely on `/content/filters` but backend lacks route.
- **Fix:** Map profile/legal screen to backend route, ensure CMS endpoints return sanitized Markdown/
  HTML. Implement missing content filter endpoint if required for filtering UI.

### 3.9 Testing & CI
- **Issue:** Jest transform failures stem from `babel-jest@30` with Jest 29; E2E workflow fails to
  install Android cmdline-tools schema v4; Vercel install fails without `--legacy-peer-deps`.
- **Fix:** Align Jest/Babel versions (see Section 2). Install `cmdline-tools;latest` before creating
  the AVD, cache system images, and guard `yes | sdkmanager --licenses` to ignore broken pipe exit
  codes (append `|| true`). Ensure `npm-shrinkwrap.json` and `backend/package-lock.json` exist before
  running the lockfile check in CI (already committed).

### 3.10 Deployment
- **Issue:** Vercel install step fails when running plain `npm install` because of React/React Native
  peer conflicts.
- **Fix:** After aligning Expo/RN versions, override Vercel’s `installCommand` to `npm install --legacy-peer-deps`
  (already in `vercel.json`). Ensure Husky prepare script is guarded (done).

### 3.11 Observability & Secrets
- Ensure `.env` files include all keys listed in `docs/` (OpenWeather, Stripe, Firebase, Sentry,
  OpenAI). Document in onboarding README.

### 3.12 Documentation & Postman
- Regenerate Postman collection from OpenAPI (`npm run smoke` uses `qa/collection.json`); update
  placeholders to hit `/api/v1` routes.

---

## 4. Ready-to-Ship Checklist

Before the final production build:

1. ✅ Align dependency pairs (Expo/RN, Jest/Babel) and regenerate shrinkwraps.
2. ✅ Implement payment method & address persistence with Prisma models and secured routes.
3. ✅ Reconcile cart, orders, loyalty, journal, personalization, and legal payload mismatches.
4. ✅ Ensure `/stripe/payment-sheet`, `/awards`, `/personalization/home`, `/content/*` routes are
   mounted and tested.
5. ✅ Update Postman collection & QA scripts to reflect live endpoints.
6. ✅ Re-run `npm run lint`, `npm run typecheck`, `npm test`, `npm --prefix backend test:ci`, Detox
   smoke tests, and Expo EAS builds.
7. ✅ Verify Vercel & Railway deployments with real environment variables and secrets in place.

Completing the above resolves all outstanding QA gaps and stabilizes the monorepo for a
master-grade production release.

