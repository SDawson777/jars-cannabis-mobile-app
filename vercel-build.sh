#!/bin/bash
set -e

# Install deps with legacy-peer-deps to bypass peer conflicts
npm install --legacy-peer-deps

# Regenerate Prisma client, fallback to skip if download fails
npx prisma generate --schema=backend/prisma/schema.prisma || \
npx prisma generate --schema=backend/prisma/schema.prisma --skip-download

# Fix lint & format errors before build
npm run lint --if-present || true
npm run format --if-present || true

# Run production build
npm run build
