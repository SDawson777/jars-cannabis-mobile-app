#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Aborting."
  echo "Set DATABASE_URL to your Postgres (or other supported) connection string and re-run."
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Using project root: $ROOT_DIR"

cd "$ROOT_DIR"

echo "Running Prisma migrate dev..."
npx prisma migrate dev --schema=./prisma/schema.prisma --name apply-migrations

echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "Done. If you have a TypeScript server running, restart it so the new client types are picked up."
