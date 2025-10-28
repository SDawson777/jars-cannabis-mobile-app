#!/bin/bash
set -euo pipefail

echo "🔧 Pre-install hook: enabling Corepack and activating Yarn 3.6.1..."

# Ensure Corepack is active so Yarn matches packageManager: yarn@3.6.1
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare yarn@3.6.1 --activate
else
  echo "⚠️ corepack not found. Attempting fallback via system yarn"
fi

echo "Node version: $(node -v || true)"
echo "Yarn version after activation (should be 3.x): $(yarn --version || true)"