# CI/CD: EAS, Firebase Test Lab, and Emulator Fallback

This project uses a secret-gated CI workflow for E2E Android tests:

- **EAS build** requires the `EXPO_TOKEN` secret.
- **Firebase Test Lab (FTL) Robo** runs if both `GCP_PROJECT_ID` and `GCP_SA_KEY_JSON` secrets are present. This runs a device-farm smoke test on the built APK.
- **Emulator fallback**: If FTL secrets are absent, the workflow falls back to running Detox tests on an ARM emulator (slower, but works on GitHub-hosted runners).

**Summary:**

| Path           | Required Secrets                            | Description                                 |
| -------------- | ------------------------------------------- | ------------------------------------------- |
| EAS + FTL Robo | EXPO_TOKEN, GCP_PROJECT_ID, GCP_SA_KEY_JSON | Fastest, runs APK on Google device farm     |
| EAS + Emulator | EXPO_TOKEN                                  | Slower, runs Detox on ARM emulator fallback |

See `.github/workflows/e2e-smoke.yml` for details.

## CI E2E smoke workflow

What this workflow does

- Builds an Android APK using EAS (requires `EXPO_TOKEN`).
- If `GCP_PROJECT_ID` and `GCP_SA_KEY_JSON` are present, runs Firebase Test Lab (Robo) against the APK.
- Otherwise falls back to running a local Android emulator on the runner (ARM image, slower).

Secrets required

- `EXPO_TOKEN`: required to authenticate with Expo/EAS for APK builds.
- `GCP_PROJECT_ID` and `GCP_SA_KEY_JSON`: when present the workflow runs Firebase Test Lab (Robo). If absent, the emulator fallback executes.

Notes

- Emulator fallback uses an arm64-v8a image to avoid KVM requirements on GitHub-hosted runners; this is slower and may require additional timeout/configuration.
- Caching is enabled for Android SDK directories and optional AVD directory to speed up repeated runs.
