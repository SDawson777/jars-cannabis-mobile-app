# Buyer Setup & Release Guide

This guide lists every file that must be updated with your real credentials and explains how to build and release the app.

## Files Requiring Credentials

| File                                | What to Update                                                                                                                                                                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.json`                          | Replace Expo project ID (`expo.extra.eas.projectId`), iOS bundle identifier (`expo.ios.bundleIdentifier`), and Android package name (`expo.android.package`).                                                                                                                                                   |
| `.env`                              | Copy from `.env.example` and fill `SENTRY_DSN`, `EXPO_PUBLIC_API_BASE_URL`, optional `EXPO_PUBLIC_CMS_API_URL`, all `EXPO_PUBLIC_FIREBASE_*` values, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_MERCHANT_ID`, and `EXPO_PUBLIC_OPENWEATHER_KEY`. |
| `backend/.env`                      | Copy from `backend/.env.example` and set `SENTRY_DSN`, `DATABASE_URL`, `OPENAI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `FIREBASE_PROJECT_ID`, `CORS_ORIGIN`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `GC_PROJECT_ID`, `GC_CLIENT_EMAIL`, and `GC_PRIVATE_KEY`.                                                  |
| `.firebaserc`                       | Update the `projects.default` value with your Firebase project ID.                                                                                                                                                                                                                                              |
| `apps/android/google-services.json` | Replace the placeholder file with the real Firebase Android config from the Firebase console. Keep this file out of version control.                                                                                                                                                                            |
| `apps/ios/GoogleService-Info.plist` | Replace the placeholder file with the real Firebase iOS config. Keep it out of version control.                                                                                                                                                                                                                 |

## Setup Steps

1. **Install dependencies**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
2. **Create environment files**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
   Fill all values listed above with your production credentials. Encode the Firebase service account JSON as base64 for `FIREBASE_SERVICE_ACCOUNT_BASE64`.
3. **Add Firebase config files**
   - Download `google-services.json` and `GoogleService-Info.plist` from the Firebase console and place them in `apps/android/` and `apps/ios/` respectively.
4. **Update app identifiers**
   - Edit `app.json` with your bundle identifier, Android package name, and Expo project ID.
   - Edit `.firebaserc` with your Firebase project ID.
5. **Configure Stripe**
   - Put the publishable key and merchant ID in `.env`.
   - Put the secret key in `backend/.env`.
6. **Build and release**
   ```bash
   npx eas login            # if not already authenticated
   npx eas build --profile production --platform ios     # iOS build
   npx eas build --profile production --platform android # Android build
   # After successful builds
   npx eas submit --platform ios --profile production
   npx eas submit --platform android --profile production
   ```

After these steps the project is ready for store submission with your branding and credentials.
