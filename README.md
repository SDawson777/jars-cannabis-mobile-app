# Jars Cannabis Mobile App

[![CI](https://github.com/SDAWSON777/jars-cannabis-mobile-app/actions/workflows/ci.yml/badge.svg)](https://github.com/SDAWSON777/jars-cannabis-mobile-app/actions)

A premium React Native mobile app for Jars Cannabis, designed to deliver an award-winning, legally compliant, and highly personalized cannabis shopping experience.

## 📱 Features (MVP)

- 🌿 Age Verification (21+ Compliance)
- 📍 Store Locator & Selection
- 🛒 Shop & Browse with Filters
- 📦 Product Detail Pages
- 🗂️ Add to Cart & Seamless Checkout
- ✅ "Pay at Pickup" Flow (MVP)
- 👤 User Account & Order History
- 📌 Legal & Support Screens

## ⚡ Tech Stack

- React Native (Expo SDK 50)
- TypeScript
- Tailwind CSS (via NativeWind)
- React Navigation
- Firebase (Auth, Firestore, Analytics)
- Secure Storage (react-native-keychain)
- GitHub Actions (CI/CD)

## 🌟 Design Philosophy

- "Cultivated Clarity" – Clean, premium, accessible UI
- "The Digital Terpene" – Personalized recommendations engine
- Age gating, geofencing, and full legal compliance
- Award-winning user experience with advanced haptics, animations, and accessibility

JARS Cannabis Mobile App

A complete, premium mobile commerce solution for cannabis retail—Expo/React Native front-end with a modern Express/TypeScript backend.All core e-commerce, user, and content features built in.Production-ready. Easy to deploy. Handover ready.

🚀 Features

Modern Expo/React Native mobile frontend (iOS, Android, Web)

Fully-documented Node.js/Express/Prisma backend API (TypeScript)

Auth, product catalog, cart, checkout, orders, user/account management

Community, education, and content modules

Dynamic theming, haptics, animations, accessibility, awards

Sentry error monitoring (just add your DSN)

End-to-end code quality: ESLint, Prettier, Husky, lint-staged, GitHub Actions CI

Cloud deploy ready (Railway, Render)

Fast local setup and test

## 📋 Requirements

- **Node.js**: 20.11.1 (use `nvm install` to auto-install from .nvmrc)
- **Package Manager**: npm 9+ (npm-only workflow, Yarn not supported)
- **Memory**: 8GB+ recommended for dependency installation
- **Mobile Development**: Expo CLI, Android Studio (for emulator), Xcode (for iOS)

## 🏗️ Monorepo Structure

This project uses a monorepo structure with dual lockfile management:

- **Root App** (React Native/Expo): Uses `npm-shrinkwrap.json` for deterministic installs
- **Backend** (Node.js/Express): Uses `package-lock.json` for backend-specific dependencies
- **Lockfile Policy**: Both lockfiles must be committed - CI will fail if either is missing
- **npm-only Workflow**: Configured for Expo GitHub Action with `packager: npm`

### CI/CD Pipeline Overview

- **Dual npm ci Installs**: Root and backend dependencies installed separately for optimal caching
- **Cache Strategy**: Keyed to both `npm-shrinkwrap.json` and `backend/package-lock.json`
- **Memory Optimization**: `NODE_OPTIONS=--max-old-space-size=4096` for large dependency trees
- **Quality Gates**: Lint, TypeScript, format checks, comprehensive test suites (frontend + backend)
- **Android E2E**: Schema v4-aware AVD setup with cmdline-tools;latest for reliable emulator testing
- **Web Export**: Non-blocking Expo web export validation

**Installation Commands:**

```bash
# Install all dependencies (root + backend)
npm run install:all

# Manual installation
npm ci                    # Root dependencies (uses npm-shrinkwrap.json)
cd backend && npm ci      # Backend dependencies (uses package-lock.json)

# Lockfile regeneration (when adding dependencies)
npm install && npm shrinkwrap        # Root shrinkwrap update
cd backend && npm install            # Backend package-lock update
```

⚡️ Quickstart

1. Clone the repository

```bash
git clone https://github.com/YOUR-ORG/jars-cannabis-mobile-app.git
cd jars-cannabis-mobile-app
```

2. Install Node and dependencies

```bash
nvm install # install Node 20.11.1 from .nvmrc
nvm use
# Install all project dependencies with memory optimization
npm run install:all
# OR manual installation:
NODE_OPTIONS="--max-old-space-size=6144" npm install --legacy-peer-deps
```

3. Setup the backend

cd backend
cp .env.example .env # Add your SENTRY_DSN, etc. (see /backend/.env.example and below)
npm install
npm run build
npm run dev # Runs backend API at http://localhost:3000

4. Setup and run the mobile app

cd ..
expo start # Open Expo dev menu (QR code for device/simulator/web)

🌐 Backend Deployment (Cloud)

Railway (Recommended)

Go to https://railway.app/

Click “New Project” → “Deploy from GitHub Repo”

Select this repo, set root to backend

Start command: npm start

Add environment variables (SENTRY_DSN, etc.) in Railway UI

Click Deploy—your backend API will be live at https://your-app.up.railway.app

Render (Alternative)

Go to https://render.com/

Create new Web Service → connect your repo

Root directory: backend

Build command: npm install && npm run build

Start command: npm start

Add env vars (SENTRY_DSN, etc.)

Deploy

### Vercel (Frontend only)

Deploy the Expo web or static frontend. This does not run the Express backend—just connect the repository and use Vercel's default build settings.

#### Environment Variables

Backend (`backend/.env`; see `backend/.env.example` for defaults):

```env
# Sentry DSN (error monitoring)
SENTRY_DSN=your-sentry-dsn

# Node environment
NODE_ENV=development

# Port (optional, defaults to 3000)
PORT=3000

# Database (optional, if using Prisma/Postgres)
DATABASE_URL=your-postgres-url
```

### 🚨 Production environment variables

When deploying the backend (for example on Railway/Render), the following variables are required and validated on startup. Missing or invalid values will cause the server to fail fast with a clear error message.

Required in production:

- JWT_SECRET: cryptographically strong secret, at least 32 characters (used to sign/verify JWTs)
- DATABASE_URL: database connection string (e.g., Postgres)
- FIREBASE_PROJECT_ID: Firebase project ID
- FIREBASE_SERVICE_ACCOUNT_BASE64: base64-encoded Firebase service account JSON
- STRIPE_SECRET_KEY: Stripe secret key
- OPENAI_API_KEY: OpenAI API key (used by the concierge route)
- OPENWEATHER_API_KEY: OpenWeather API key (used by weather integrations)

Optional (defaults exist):

- PORT: default 8080
- CORS_ORIGIN: allowed origin(s) for CORS
- WEATHER_API_URL: default https://api.openweathermap.org/data/2.5
- WEATHER_CACHE_TTL_MS: default 300000 (5 minutes)
- DEBUG_DIAG: '0' or '1'

Generate a strong JWT secret (copy the output and set JWT_SECRET):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Or using OpenSSL:

```bash
openssl rand -base64 48
```

Frontend (`.env`):

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Sentry Setup

The app is preconfigured with Sentry for crash and error reporting. To use your own
Sentry project:

1. Copy `.env.example` to `.env`.
2. Replace the `SENTRY_DSN` value with the DSN from your Sentry project.
3. Rebuild or restart the app.

With the DSN set, runtime errors and unhandled exceptions will appear in your
Sentry dashboard under that project.

## Design Assets

Certain icons, audio cues and Lottie animations are required under `src/assets`.
The list of files lives in `scripts/expectedAssets.ts` and can be verified with
`npm run check-assets`. CI will fail if any are missing.

The repo also includes a `Terpene_Wheel_Code_Kit.zip` archive. Run
`npm run integrate-terpene-assets` to extract this kit into `assets/terpene-wheel`
when you want to use the terpene wheel module.

🧪 Testing & Quality

**Lint:** `npm run lint` (ESLint with minimatch override for compatibility)

**Format:** `npm run format:ci` (Prettier - fails CI if not formatted)

**Type Safety:** `npm run typecheck` (TypeScript compilation)

**Unit Tests:** `npm run test:ci` (Jest + React Native Testing Library)

**Backend Tests:** `npm --prefix backend run test:ci` (Jest + Supertest)

**E2E Tests:** `npm run test:e2e:android` (Detox with Android emulator)

**Pre-commit hooks:** Linting and formatting run automatically on commit

## � CI/CD Pipeline

### GitHub Actions Workflows

**Main CI (`ci.yml`)**

- Triggers: Push to main, Pull Requests
- Node.js 20.11.1 with 4GB memory allocation
- Runs: lint → format → typecheck → tests → backend tests → audit
- Caches: npm cache, backend node_modules

**E2E Smoke Tests (`e2e-smoke.yml`)**

- Android emulator with API 34 (Pixel XL)
- EAS Build integration for app compilation
- Comprehensive Android SDK caching
- Firebase backend integration for full-stack testing
- Detox test suite: Auth → Cart → Checkout → Concierge → Awards → Weather → Legal

**Lint & Format (`lint-and-format.yml`)**

- Fast formatting and linting checks
- Fails build on format violations

**Newman Smoke Tests (`newman-smoke.yml`)**

- API endpoint testing with Postman collections

### Memory Optimization

All workflows include `NODE_OPTIONS: "--max-old-space-size=4096"` to prevent memory exhaustion during:

- Dependency installation (`npm ci --legacy-peer-deps`)
- ESLint execution with large codebases
- TypeScript compilation
- Test execution

### Caching Strategy

- **npm cache**: Automatic via `actions/setup-node@v4`
- **Android SDK**: system-images, platforms, build-tools, AVDs
- **Backend dependencies**: Separate cache key based on backend/package-lock.json

### Build Artifacts

E2E tests upload artifacts on failure:

- Detox screenshots and videos
- Test execution logs
- Device/emulator state dumps

## 🚀 Local Development

### Run Detox E2E Tests Locally

1. **Setup Android Emulator**

   ```bash
   # Create AVD (if not exists)
   avdmanager create avd --force --name "Pixel_XL_API_34" --package "system-images;android-34;google_apis;x86_64" --tag "google_apis" --abi "x86_64"

   # Start emulator
   emulator -avd Pixel_XL_API_34 -no-snapshot -no-window
   ```

2. **Build E2E App**

   ```bash
   npm run build:e2e:android
   ```

3. **Start Backend (separate terminal)**

   ```bash
   cd backend
   NODE_ENV=test npm start
   ```

4. **Run Tests**
   ```bash
   npm run test:e2e:android
   ```

### Development Scripts

```bash
# Install all dependencies with memory optimization
npm run install:all

# Clean reinstall
npm run clean:modules

# Start development servers
npm run start                    # Expo dev server
npm run android                 # Android-specific
npm run ios                     # iOS-specific
npm run demo:web               # Web demo
npm run start:backend          # Express API server
```

## Compliance

### Accessibility

- Interactive elements include screen reader labels, roles, and helpful hints.
- Modals are marked as accessible and announce themselves to assistive technologies.
- Text supports dynamic font scaling for better readability.
- Color choices follow WCAG 2.1 AA contrast guidelines.

📦 Project Structure

```plaintext
jars-cannabis-mobile-app/
├─ backend/            # Node.js/Express/Prisma backend
├─ src/                # React Native app source
│  ├─ screens/
│  ├─ context/
│  └─ navigation/
├─ App.js              # Expo/React Native entry
├─ package.json
└─ README.md
```

🙋 FAQ

Where do I set my Sentry DSN? Add to `backend/.env` as `SENTRY_DSN=<your-sentry-dsn>`.

How do I deploy the backend?See Backend Deployment (Cloud) above.

Where is the mobile app code?All React Native code is in /src. Entry point is App.js.

How do I add environment variables in production?Use your platform’s UI (Railway/Render/Heroku/etc).

## CI: EAS Android keystore (secrets & one-time setup)

To allow CI to produce signed Android APKs for preview builds, add these GitHub Actions secrets:

- `EXPO_TOKEN` — your Expo access token (already used by CI).
- `EXPO_ANDROID_KEYSTORE_BASE64` — base64-encoded JKS keystore file (contents of your .keystore file encoded with base64 - see below).
- `EXPO_ANDROID_KEYSTORE_PASSWORD` — the keystore password (e.g. `DemoPass123`).
- `EXPO_ANDROID_KEY_ALIAS` — the alias inside the keystore (e.g. `upload`).
- `EXPO_ANDROID_KEY_PASSWORD` — the key password (e.g. `DemoPass123`).

How to produce the base64 keystore locally:

```bash
# Example: produces a single-line base64 string suitable for a GitHub secret
base64 -w0 path/to/your.keystore > android-demo.keystore.b64
```

One-time local interactive step (recommended):

1. Install and login to EAS locally:

```bash
npm install -g eas-cli
eas login
```

2. Run the interactive configure command and choose Android → "Let EAS manage credentials":

```bash
eas build:configure
# choose: Android -> Let EAS manage credentials
```

This either seeds Expo-managed remote credentials or you can instead provide the keystore via the secrets above (CI reads `EXPO_ANDROID_*` env vars and will use a local keystore if `credentialsSource: "local"` is set in `eas.json`).

Security note: always store keystores and passwords in GitHub Secrets; do not commit them to source control.

🤝 Buyer Information & Support

See [docs/buyer-setup.md](docs/buyer-setup.md) for configuring credentials and running production builds.

Licensing & Transfer:

You receive full ownership and source code on sale/transfer.

All code is MIT-licensed unless otherwise stated (customizable for your business needs).

Delivery includes:

Complete GitHub repository access (with full commit history)

All environment variable examples and setup scripts

Full technical documentation (this README)

Setup/deployment walkthrough on request

White-labeling:

All logos, colors, and brand assets can be swapped for your organization.

Codebase is designed for rapid rebranding and custom flows.

Optional Onboarding & Support:

1-on-1 onboarding session (Zoom/Teams) available post-sale for technical handoff.

Priority support for 30 days after transfer (by arrangement).

Future feature additions, design tweaks, or custom integrations available as contract add-ons.

For technical support or additional services, open an issue in your private repo or contact the developer directly.

This project is plug-and-play for cannabis retail: just add your branding, API keys, and deploy.

Contact for licensing, transfer, or deployment help!

## How to Enable Apple Pay After Acquisition

1. Enable Apple Pay in your Apple Developer account and create a Merchant ID.
2. Replace `STRIPE_PUBLISHABLE_KEY` and `STRIPE_MERCHANT_ID` in your `.env` with production values.
3. Add the Merchant ID to the Xcode project and enable the Apple Pay entitlement in both Xcode and App Store Connect.
4. Rebuild and submit the app. Apple Pay activates automatically once the merchant ID is configured.

### App Store Notes

- Apple Pay will activate when a valid merchant ID is added.
- You must enable the Apple Pay entitlement in Xcode and App Store Connect.

## App Store Prep Checklist

- Ensure privacy policy and terms links resolve correctly.
- Provide a support URL and compliance details in `assets/app-store-info.md`.
- Capture final screenshots in `assets/screenshots/` before submission.
- When answering Apple's cannabis questionnaire, include your state license number and confirm sales occur only where legal.

## Local Dev Quick-start

```
cp .env.example .env   # fill keys
npm run dev:emulators  # Firestore/Auth/CF
npm run dev:expo       # Expo client against local emu
```

## Custom Dev Client

Generate native projects and build a custom development client:

```bash
npx expo prebuild
npx expo run:android   # or npx expo run:ios
```

## Push Notifications Setup

1. Add your Firebase config files:
   - Place `google-services.json` in `android/app`.
   - Place `GoogleService-Info.plist` in the iOS project. The repo contains a
     placeholder with dummy keys; download the real file from the Firebase
     console (Project settings → _General_ → _Your apps_) or request it from a
     maintainer and keep it out of version control. If a real key was
     previously committed, rotate it in the Firebase console.
2. **iOS:** Enable Push Notifications and Background Modes (Remote notifications) in Xcode. Upload your APNs key to Firebase.
3. **Android:** Confirm `google-services.json` is present and Firebase Messaging is referenced in `AndroidManifest.xml`.
4. On launch the app requests notification permission and logs the FCM token. Replace the sync stub in `App.tsx` to send the token to your backend if needed.
5. Send a test message from the Firebase console to verify foreground, background, and quit-state behavior.

## New Endpoints (Launch)

- Recommendations: `GET /recommendations/for-you`, `GET /recommendations/related/:productId`
- Reviews: `POST /products/:id/reviews`
- Loyalty: `GET /loyalty/status`, `GET /loyalty/badges`
- Concierge: `POST /concierge/chat`
- Journal: `GET/POST/PUT /journal/entries*`
- AR: `GET /ar/models/:productId`
- Preferences: `GET/PUT /profile/preferences`
- Awards: `GET /awards/status`
- Webhooks: `POST /webhook/stripe` (order status notifications)

## Contributing

We welcome improvements and bug fixes. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, coding standards, and test instructions.

## Code of Conduct

Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to help us maintain a respectful community.
