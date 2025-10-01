# CI, EAS (Expo) and Firebase Test Lab — quick checklist and required secrets

This short doc explains what the repository's CI (green-path) expects for EAS builds and Firebase Test Lab (FTL) runs, how to produce the required secrets, and a short list of remaining untyped/`any` hotspots discovered during a sweep.

1. ## Purpose

- CI builds an Android APK with EAS and then (optionally) runs a Firebase Test Lab Robo smoke test. The CI workflow uses `eas build --profile apk` and expects an `apk` profile in `eas.json` (present in this repo).

2. ## Required GitHub secrets (names used by the workflow)

- EXPO_TOKEN (required) — an Expo access token used by the Expo / EAS GitHub Action for non-interactive builds.
- GC_PROJECT_ID (required for FTL step) — the Google Cloud project id used for Firebase / FTL.
- GCP_SA_KEY_JSON (required for FTL step) — the service account JSON for a GCP service account that CI can use to authenticate with gcloud. The workflow expects this value to be the raw JSON or a base64-encoded JSON string depending on how you prefer to set it.
- APPETIZE_API_TOKEN (optional) — used by the optional Appetize upload step if you want an instantly-embeddable demo.
- APPETIZE_API_PRIVATE_KEY (optional) — optional private key for Appetize (if used).

3. ## Minimal IAM permissions for the service account used by FTL

- The service account should have permissions to run Firebase Test Lab and to write/read results: at minimum give it access to
  - Cloud Storage (to upload / read test artifacts) — e.g. Storage Object Admin / Storage Admin
  - Firebase Test Lab / Testing API permissions (the account must be allowed to invoke test runs)

  Exact role names can vary; if in doubt create a dedicated service account and grant the least-privilege combination that allows FTL runs and storage writes. If you prefer, temporarily grant Editor while configuring, then tighten the roles.

4. ## How to create the service account JSON and add it to GitHub (example)

1) In GCP console create a service account for CI and grant it the required roles (Storage object admin + Testing invoker / Firebase Test Lab related roles).
2) Generate a JSON key and download it as gcloud-key.json.
3) From your local machine you can base64 the file (optional) and set a GitHub secret.

Example (Linux/macOS):

```bash
gh secret set GCP_SA_KEY_JSON --body "$(cat gcloud-key.json)"

# Or: base64-encode the JSON and set that as the secret (avoids newline issues):
base64 -w0 gcloud-key.json | xargs -0 -I{} gh secret set GCP_SA_KEY_JSON --body "{}"
```

Also set:

```bash
gh secret set GC_PROJECT_ID --body "your-gcp-project-id"
gh secret set EXPO_TOKEN --body "<your-expo-token>"
gh secret set APPETIZE_API_TOKEN --body "<token>"  # optional
```

5. ## Local verification commands (run in the repo root)

- Install and build

```bash
npm ci
npm run typecheck   # or: npx tsc -p tsconfig.json
npm run lint
npm test -- --runInBand  # or npm run test:ci
```

5.1 ## Expo keystore (one-time local setup — recommended)

If your CI uses `eas build --non-interactive` (as this repo does), EAS cannot generate a new Android keystore during the CI run. The recommended, safest approach is to let EAS manage the keystore remotely for the project. Run the following locally once from your developer machine.

Commands (run from the repo root):

```bash
# 1) Sign in to Expo
eas login
eas whoami

# 2) (Optional) Link the repository to an Expo project if not already linked
eas project:init

# 3) Configure Android build and provision a remote keystore (interactive)
eas build:configure --platform android

# When prompted choose: "Let EAS manage your credentials"

# 4) Verify the keystore is present on Expo servers
eas credentials --platform android
# You should see an entry like: "Keystore: Present"
```

After these steps push your branch or update main. The CI can keep `--non-interactive` and will use the remote credentials that EAS stores for the project.

Notes: if you prefer to keep the keystore under your control instead of Expo-managed (option B), you can export the keystore, base64-encode it, and store the keystore and passwords in GitHub Secrets (ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD) and update your EAS profile to use `credentialsSource: "local"` or provide credentials via `eas credentials`/the CI step. The Expo docs cover both flows.

These are the same checks the CI runs locally before launching the EAS build.

6. ## Remaining "any" / untyped hotspots (findings)
   I scanned the codebase for remaining `any` usages and places where `axios` is invoked with loose types. The following list is the prioritized set of hotspots found; these are not compilation errors, but they reduce type safety and should be cleaned up incrementally.

High priority (affect HTTP helpers / clients)

- `src/api/http.ts` — uses `data as any` in `postJSON`, `clientPost` and `clientPut`. This is an intentional accommodation for tests that mock calls without a config object. Suggested fix: cast to `unknown as TReq` (safer than `any`) or add an overload which accepts `void`/`undefined` for the data argument when appropriate.
- `src/api/phase4Client.ts` — request interceptor types are permissive and use `(config: any)` and `(config.headers as any).Authorization` and `getAuthToken as any`. Suggested fix: type the interceptor param as `AxiosRequestConfig` and type `getAuthToken` to return `string | undefined` (or `string | Promise<string | undefined>` if async, but the code currently throws if Promise).

Medium priority (hooks / call-sites casting data)

- `src/hooks/useCart.ts` — many `as any` casts when normalizing `data` responses (cart). Consider providing a stronger response type from the client call or a narrow type guard to remove the need for `as any`.
- `src/hooks/useProductDetails.ts`, `src/hooks/useCartValidation.ts`, `src/screens/*` — a number of `as any` usages when projecting API responses into local shapes. These can be converted to typed response shapes (e.g. `clientGet<ProductDetailResponse>(...)`) and then narrow types in the hook.

Low priority (ambient declarations)

- `src/@types/*.d.ts` — several ambient overrides declare `any` in places (React refs, external libs). These are sometimes necessary for third-party libs; consider narrowing types where possible.

Representative files that contain `as any` or `any`-casts related to HTTP/data usage:

- src/api/phase4Client.ts — interceptor uses `any` (lines around headers/token)
- src/api/http.ts — `data as any` in post/put helpers
- src/clients/cmsClient.ts and src/clients/authClient.ts — created with `(axios as any).create(...)` (these can be typed as `AxiosInstance`)
- src/hooks/useCart.ts — many data normalization `as any` casts
- src/hooks/useProductDetails.ts — payload parsing uses `as any`
- src/hooks/useProducts.ts — contains `} as any` when constructing query keys
- src/screens/\* — various screens use `(data as any)` to access error fields or nested shapes
- src/@types/\* — ambient types with `any` usage

7. ## Suggested remediation roadmap

1) Tighten the HTTP helpers first (small, high impact)
   - Replace `data as any` with `data as unknown as TReq` (safer) or introduce helper overloads.
   - Change `createXClient()` helpers to explicitly return `AxiosInstance` instead of `(axios as any)`.
2) Type the phase4 client interceptor parameter as `AxiosRequestConfig` and declare `getAuthToken` return type.
3) Sweep hooks that call `clientGet`/`clientPost` and remove `as any` by annotating the concrete response shape in the `clientGet<T>()` call.
4) Gradually reduce ambient `any` in `src/@types` by replacing `any` with `unknown` and creating minimal helper functions that narrow shapes.

8. ## Next steps I can take for you

- I can open PR(s) to:
  - Replace `data as any` in `src/api/http.ts` with `unknown as TReq` and add a comment explaining the reason.
  - Type the `phase4Client` interceptor to `AxiosRequestConfig` and adjust `getAuthToken` usage.
  - Run a follow-up search to produce a ranked list of files that are easiest to fix and prepare a patch for the easiest 5 files.

If you'd like I can implement the first two (small) fixes now and run typecheck + tests. Tell me which you'd prefer and I'll proceed.

---

Revision: 2025-10-01 — added by automation to document CI/EAS secrets and to record a sweep for remaining `any` usages.
