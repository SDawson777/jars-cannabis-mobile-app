#!/usr/bin/env bash
set -euo pipefail

# Minimal demo runner: starts backend (mock-friendly) and Expo web with local API base URL.

export EXPO_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1"

# Optional: quiet Sentry/Stripe for local demo
export SENTRY_DSN=""
export STRIPE_PUBLISHABLE_KEY=""
export STRIPE_MERCHANT_ID=""

(
  cd "$(dirname "$0")/.."/backend
  # Start TypeScript backend in dev mode; relies on lazy Prisma to avoid DB at boot
  npx npm-run-all --parallel "dev"
) &

(
  cd "$(dirname "$0")/.."
  # Start Expo in web mode for quick demo
  npx expo start --web
) &

wait

