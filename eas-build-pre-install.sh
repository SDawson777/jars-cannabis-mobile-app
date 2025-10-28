#!/bin/bash
set -euo pipefail

echo "🔧 [eas-build-pre-install] Enabling Corepack and activating Yarn 3.6.1 on EAS builder"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare yarn@3.6.1 --activate
else
  echo "⚠️ corepack not found on this runner (unexpected). Continuing anyway."
fi

echo "Node version on EAS builder: $(node -v || true)"
echo "Yarn version after activation (should be 3.x): $(yarn --version || true)"
