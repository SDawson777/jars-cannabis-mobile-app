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

- React Native (Expo)
- Typescript
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

⚡️ Quickstart

1. Clone the repository

git clone https://github.com/YOUR-ORG/jars-cannabis-mobile-app.git
cd jars-cannabis-mobile-app

2. Install Node and dependencies

nvm install # install Node version from .nvmrc
nvm use
chmod +x setup.sh
./setup.sh

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

Vercel (Frontend only)

Deploy Expo web or static frontend (does not run Express backend).

Just connect repo, use default build settings.

⚙️ Environment Variables

Backend (/backend/.env – see /backend/.env.example for defaults):

# Sentry DSN (error monitoring)

SENTRY_DSN=your-sentry-dsn

# Node environment

NODE_ENV=development

# Port (optional, defaults to 3000)

PORT=3000

# Database (optional, if using Prisma/Postgres)

DATABASE_URL=your-postgres-url

Frontend (/.env):

EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

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

Lint:npm run lint (ESLint)

Format:npm run format (Prettier)

Test (backend):npm run test (Jest + Supertest)

Pre-commit hooks:Linting and formatting run automatically on commit

🛠️ CI/CD

GitHub Actions: runs tests/lints for every PR

Sentry: error monitoring (just set your DSN in .env)

## Compliance

### Accessibility

- Interactive elements include screen reader labels, roles, and helpful hints.
- Modals are marked as accessible and announce themselves to assistive technologies.
- Text supports dynamic font scaling for better readability.
- Color choices follow WCAG 2.1 AA contrast guidelines.

📦 Project Structure

jars-cannabis-mobile-app/
backend/ # Node.js/Express/Prisma backend
src/
.env.example
...
src/ # React Native app source
screens/
context/
navigation/
...
App.js # Expo/React Native entry
package.json
README.md

🙋 FAQ

Where do I set my Sentry DSN?Add to /backend/.env as SENTRY_DSN=...

How do I deploy the backend?See Backend Deployment (Cloud) above.

Where is the mobile app code?All React Native code is in /src. Entry point is App.js.

How do I add environment variables in production?Use your platform’s UI (Railway/Render/Heroku/etc).

🤝 Buyer Information & Support

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
   - Place `GoogleService-Info.plist` in the iOS project.
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
