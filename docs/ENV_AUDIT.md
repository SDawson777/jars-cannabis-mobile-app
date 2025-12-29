Environment Audit — EXPO*PUBLIC*\* usage

Summary

- I scanned the repository for `EXPO_PUBLIC_` occurrences to identify values that are client-exposed.
- Below is a categorized list of the variables found, where they appear, and recommendations whether they should remain public or be moved to server-side secrets.

Findings (key occurrences)

- `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_BASE_URL`
  - Found in: `.env`, `.env.example`, `eas.json`, `README.md`, `DEPLOYMENT.md`, multiple docs and scripts, `src/utils/apiConfig.ts`, `src/utils/cmsConfig.ts`, `src/hooks/useAI.ts`, `src/context/BrandContext.tsx`, `src/screens/AppSettingsScreen.tsx`
  - Purpose: Base URL for mobile app to call backend API.
  - Recommendation: Keep as `EXPO_PUBLIC_` (client needs the base URL). Use the single canonical constant `API_BASE_URL` from `src/utils/apiConfig.ts`, which reads `process.env.EXPO_PUBLIC_API_URL`. Do not include path segments (e.g., `/api` or `/api/v1`) in `EXPO_PUBLIC_API_URL`; client code appends `/api/...` paths.

- `EXPO_PUBLIC_CMS_API_URL`
  - Found in: `.env.example`, `.env`
  - Purpose: Optional CMS API endpoint for content.
  - Recommendation: Acceptable as `EXPO_PUBLIC_` if CMS is public content; otherwise move server-side.

- `EXPO_PUBLIC_FIREBASE_*` (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, SENDER_ID, APP_ID, MEASUREMENTID)
  - Found in: `config/firebaseClient.ts`, `.env.example`, `.env`
  - Purpose: Firebase client config needed by mobile SDKs.
  - Recommendation: These are client-side config values (not secrets) — keep as `EXPO_PUBLIC_`.

- `EXPO_PUBLIC_OPENWEATHER_KEY`
  - Found in: `.env.example`, `.env`, `src/context/ThemeContext.tsx`.
  - Purpose: OpenWeather API key used by mobile for weather-based theming.
  - Recommendation: This is an API key — consider moving to server-side proxy to avoid exposing it in client bundles, or restrict its usage via provider dashboard. If left client-exposed, accept the risk.

- `EXPO_PUBLIC_BRAND_NAME`, `EXPO_PUBLIC_BRAND_SLUG`
  - Found in: `src/config/whiteLabel.ts`, `.env.example`, scripts
  - Purpose: White-label runtime values; safe to be public.

- `EXPO_PUBLIC_DEBUG`
  - Found in `App.tsx`.
  - Purpose: Client-side debug toggle. Keep public.

Other non-EXPO_PUBLIC vars used in client code (important to ensure not exposed):

- `SENTRY_DSN` appears in `.env` / docs — check whether you use `SENTRY_DSN` (server) vs `EXPO_PUBLIC_SENTRY_DSN` (client). In this repo `App.tsx` reads `process.env.SENTRY_DSN` (server) — ensure you use `EXPO_PUBLIC_SENTRY_DSN` for client-side Sentry DSN only if intended.

Update: `App.tsx` now prefers `EXPO_PUBLIC_SENTRY_DSN` for client builds and falls back to `SENTRY_DSN`. If you want Sentry enabled in the mobile bundle, populate `EXPO_PUBLIC_SENTRY_DSN` in build-time secrets (EAS secrets / CI). Otherwise keep `SENTRY_DSN` for server-side usage only.

Recommendations & Next Steps

1. Canonical API var: Use `API_BASE_URL` from `src/utils/apiConfig.ts` (reads `EXPO_PUBLIC_API_URL`).

- Update any code that directly uses `process.env.EXPO_PUBLIC_API_BASE_URL` (if present) to use `process.env.EXPO_PUBLIC_API_URL` or `API_BASE_URL`.

2. Replace occurrences: Run a search-replace to standardize `EXPO_PUBLIC_API_URL` across docs, config, and code (I can do this if you want me to).
3. Sensitive keys: Consider moving `EXPO_PUBLIC_OPENWEATHER_KEY` to a server-side proxy or use restricted API keys.
4. Add `.env.example` guidance: Mark which values are safe to expose (`EXPO_PUBLIC_`) and which must remain server-only.
5. CI/EAS: Ensure `eas.json` and CI secrets are set via secure variables, not committed to repo.

If you want, I can now:

- Replace non-canonical base URL uses to the canonical `EXPO_PUBLIC_API_URL`/`API_BASE_URL`.
- Add a small script to validate `.env` vs `.env.example` and fail CI if any `EXPO_` keys that look secret are present.
