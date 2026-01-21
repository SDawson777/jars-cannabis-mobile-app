#!/bin/sh
set -e

echo "🚀 Starting JARS Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
while ! nc -z ${DATABASE_HOST:-db} ${DATABASE_PORT:-5432}; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
while ! nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}; do
  sleep 1
done
echo "✅ Redis is ready!"

# Note: Database migrations are managed by the nimbus-cms repository
# This backend consumes APIs and doesn't run migrations
echo "ℹ️  Database migrations are managed by nimbus-cms repo"

echo "🎯 Starting backend server..."
# Start the server
exec node dist/index.js