#!/bin/bash

# Fix dependencies in a full-stack Expo + Firebase + Prisma project

echo "🧹 Cleaning old dependencies and lockfiles..."
rm -rf node_modules backend/node_modules
rm -f package-lock.json backend/package-lock.json

echo "📦 Installing root dependencies (Expo + React Native)..."
npm install --legacy-peer-deps

echo "📦 Installing backend dependencies (Express, API server)..."
cd backend
npm install --legacy-peer-deps
cd ..

# Note: Prisma schema is managed in nimbus-cms repo, not here
# Backend uses @prisma/client which is installed as a dependency

echo "🧪 (Re)Installing dev tools (ESLint, Husky, etc.)..."
npm install --save-dev \
  eslint \
  prettier \
  lint-staged@13.2.3 \
  husky@8.0.3 \
  @testing-library/react@13.4.0 \
  jest --legacy-peer-deps

echo "🔐 Running safe audit fix..."
npm audit fix || true

echo "📊 Writing audit report to final-audit.json..."
npm audit --json > final-audit.json

echo "✅ Dependency fix complete. Please commit your updated package-lock.json files."