# Nimbus Cannabis OS – White-Label Setup

This guide explains how to rebrand the Nimbus Cannabis OS Mobile app for a new tenant while preserving compatibility with existing builds and deep links.

## 1. Color, Typography, and Theme

Key theme configuration lives in:

- `src/context/ThemeContext.tsx`
- `tailwind.config.js`

Update:

- Primary / secondary brand colors
- Backgrounds and surface colors
- Typography scale and font families (if using custom fonts)

> Recommendation: keep sufficient contrast ratios to preserve accessibility.

## 2. Icons, Logos, and Splash Screens

Nimbus-branded assets are scoped under:

Default placeholders:

Legacy Jars assets should be moved to:

#### Automated asset replacement

Use the helper script to copy your brand assets into the expected paths:

```bash
scripts/white-label-assets.sh /path/to/brand-assets
```

Expected files in the source directory:

- `icon.png` → `assets/nimbus/nimbus-icon.png`
- `splash.png` → `assets/nimbus/nimbus-splash.png`
- Optional: `logo.png`, `logo-dark.png`, `onboarding-1.png`, `onboarding-2.png`, `onboarding-3.png`

After replacing assets, rebuild the app to verify icons and splash screens.

- `assets/legacy/`

### Expo / Cross‑platform config

Update `app.config.ts`:

- `name`: human‑readable app name (e.g., `Nimbus Cannabis OS`)
- `slug`: URL‑safe slug (e.g., `nimbus-cannabis-mobile`)
- `ios.bundleIdentifier` / `android.package`: per-tenant bundle IDs
- `splash.image`: point to `./assets/nimbus/nimbus-splash.png`
- Icon configuration: point to `./assets/nimbus/nimbus-icon.png`

### Native icons

Android:

- Replace adaptive/mipmap icons under `android/app/src/main/res/mipmap-*/` with tenant-branded icons.

iOS:

- Update the AppIcon asset catalog in `ios/JARS/` (or the renamed project) to use tenant icons derived from `assets/nimbus/nimbus-icon.png`.

## 3. CMS / Tenant Connectivity

Backend and CMS connectivity is driven by environment variables and the Phase 4 API client:

- `backend/` (Express + Firestore)
- `src/api/phase4Client.ts`

To connect to a new tenant:

- Configure base URLs and API keys in `.env` / EAS secrets.
- Ensure the tenant’s CMS exposes the same contract as documented in `backend/openapi.yaml`.
- If adding new fields, extend TypeScript types in `src/@types/*` and adjust UI components, but avoid breaking existing routes.

## 4. Copy and Routes – Safe Changes

You may safely change **visible copy** without breaking navigation, as long as you:

- Do **not** rename route IDs in `src/navigation/types.ts`.
- Do **not** change screen names registered in stacks/tab navigators (e.g., `MyJars`, `MyJarsInsights`).

Safe to change:

- Headlines and subtitles on onboarding, home, awards, concierge, and legal screens.
- Empty state text, button labels, and badge copy.

Unsafe to change without review:

- Keys in `RootStackParamList` and other navigation type maps.
- Deep-link path fragments declared in `app.config.ts` and `src/navigation/linking.ts`.

## 5. Deep Links and Schemes

Deep linking is configured in `app.config.ts`:

- `scheme: 'nimbus'`
- `linking.prefixes`: `['nimbus://', 'https://nimbus.app/', 'https://www.nimbus.app/']`

To white-label for another brand:

- Choose a new URL scheme (e.g., `tenantx`).
- Configure HTTPS prefixes on the correct domain (e.g., `https://tenantx.app/*`).
- Keep screen mapping stable; if you must change paths, add aliases instead of removing existing ones so older links continue to work.

## 6. Native Project Rename (High‑Level)

When renaming the native projects for a white‑label build:

Android:

- Update `rootProject.name` in `android/settings.gradle`.
- Ensure `android/app/src/main/res/values/strings.xml` `app_name` reflects the tenant brand.
- Keep `android.package` in `app.config.ts` consistent with Play Store settings.

iOS:

- In Xcode, rename the project and scheme from the old name (e.g., `JARS`) to the tenant brand (e.g., `Nimbus`).
- Update `CFBundleDisplayName` in `ios/*/Info.plist` to the tenant display name.
- Update URL schemes in `Info.plist` to use the new scheme while keeping legacy aliases when needed.

> Always run `eas build -p ios -p android` with a new profile after renaming native artifacts to confirm EAS can still prebuild successfully.
