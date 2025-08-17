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

# Prisma client (only if your monorepo has backend/prisma/schema.prisma)
if [ -f "backend/prisma/schema.prisma" ]; then
  echo "🧬 Generating Prisma client…"
  npx prisma generate --schema=backend/prisma/schema.prisma \
  || npx prisma generate --schema=backend/prisma/schema.prisma --skip-download \
  || echo "⚠️ Prisma generate skipped (no engine download available)"
fi

echo "🧹 Lint/format…"
npm run lint --if-present
npm run format --if-present

echo "🏗️ Building…"
npm run build
echo "✅ Build complete."
