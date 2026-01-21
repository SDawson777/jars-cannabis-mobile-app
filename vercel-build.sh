#!/usr/bin/env bash
set -Eeuo pipefail

# Skip husky/prepare in CI
export HUSKY=0
export CI=${CI:-true}
export VERCEL=${VERCEL:-true}

echo "⏬ Installing deps (ignoring lifecycle scripts to avoid husky in CI)…"
if [ -f package-lock.json ]; then
  npm ci --ignore-scripts || npm install --ignore-scripts --legacy-peer-deps
else
  npm install --ignore-scripts --legacy-peer-deps
fi

# Note: Prisma schema is managed in nimbus-cms repo, not here
# The backend uses @prisma/client which connects to the shared database

echo "🧹 Lint/format…"
npm run lint --if-present
npm run format --if-present

echo "🏗️ Building…"
npm run build
echo "✅ Build complete."
