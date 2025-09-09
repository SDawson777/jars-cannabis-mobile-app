# Mobile dev with EAS + dev-client

This project uses several native modules that are not included in Expo Go. Use EAS to build a custom development client that includes the native modules your app needs.

Prerequisites

- Install Node 18+ and npm 9+
- Have an Expo account (you can create one at https://expo.dev)

Quick steps

1. Install EAS CLI (global or use npx):

```bash
npm install -g eas-cli
# or
npx eas-cli --version
```

2. Login to Expo:

```bash
npx eas login
```

3. Build a development client (Android APK) and install on device/emulator:

```bash
npx eas build --platform android --profile development
# follow the build url, download the APK, and install on a device/emulator
```

4. Start the dev server with the dev-client:

```bash
npx expo start --dev-client
```

Notes

- For iOS simulator builds you can use the `ios.simulator` option; building for a physical iOS device requires Apple credentials.
- EAS may ask to manage credentials; follow the prompts or use manual credential management.
- The `eas.json` in the repo contains a minimal `development` profile that builds a dev-client with an `apk` for Android and a simulator build for iOS.

Troubleshooting

- If a native module fails to compile, check its README for required Android/iOS setup steps.
- If you prefer not to build a dev client, you can replace native modules with Expo-compatible alternatives, but that can be more work.

If you want, I can create CI steps for automated EAS preview builds or help migrate native modules to Expo-managed equivalents.
