#!/bin/bash
set -euo pipefail

echo "🔧 Enabling Corepack and activating Yarn Berry..."
corepack enable
corepack prepare yarn@3.6.1 --activate

echo "✅ Corepack + Yarn Berry ready"
yarn --version