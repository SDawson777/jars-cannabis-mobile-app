#!/bin/bash

# JARS Mobile App Setup Script
# Refactored to use local tools and npx, avoiding global installs

set -e  # Exit on error

echo "🌿 Setting up JARS Mobile App development environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check npm version
echo "📋 Checking npm version..."
if ! command_exists npm; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm version: $(npm --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci --legacy-peer-deps

# Install backend dependencies if backend exists
if [ -d backend ]; then
    echo "📦 Installing backend dependencies..."
    (cd backend && npm ci --legacy-peer-deps)
fi

# Check local devDependencies are installed (these replace global installs)
echo "🔧 Checking development tools..."

# Test Expo CLI via npx
echo "📱 Testing Expo CLI..."
if npx expo --version >/dev/null 2>&1; then
    echo "✅ Expo CLI available via npx (version: $(npx expo --version))"
else
    echo "⚠️  Expo CLI not available. Installing as dev dependency..."
    npm install --save-dev expo
fi

# Test Firebase tools via npx
echo "🔥 Testing Firebase tools..."
if npx firebase --version >/dev/null 2>&1; then
    echo "✅ Firebase tools available via npx (version: $(npx firebase --version))"
else
    echo "⚠️  Firebase tools not available in project dependencies"
    echo "ℹ️  Use 'npx firebase-tools@latest' for Firebase commands"
fi

# Note: Prisma schema is managed in nimbus-cms repo, not here
echo "ℹ️  Note: Database schema is managed in the nimbus-cms repository"

# Verify TypeScript
echo "📝 Testing TypeScript..."
if npx tsc --version >/dev/null 2>&1; then
    echo "✅ TypeScript available via npx (version: $(npx tsc --version))"
else
    echo "❌ TypeScript not available"
    exit 1
fi

# Verify Jest
echo "🧪 Testing Jest..."
if npx jest --version >/dev/null 2>&1; then
    echo "✅ Jest available via npx (version: $(npx jest --version))"
else
    echo "❌ Jest not available"
    exit 1
fi

# Verify ESLint
echo "🔍 Testing ESLint..."
if npx eslint --version >/dev/null 2>&1; then
    echo "✅ ESLint available via npx (version: $(npx eslint --version))"
else
    echo "❌ ESLint not available"
    exit 1
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Development commands:"
echo "  npm start           - Start Expo development server"
echo "  npm run android     - Start Android development"
echo "  npm run ios         - Start iOS development"
echo "  npm run web         - Start web development"
echo "  npm run typecheck   - Run TypeScript checking"
echo "  npm run lint        - Run code linting"
echo "  npm run test        - Run tests"
echo ""
echo "🔧 Tool commands (using npx):"
echo "  npx expo --help     - Expo CLI help"
echo "  npx firebase --help - Firebase tools help"
echo ""
echo "📚 For more information, see README.md"
echo "ℹ️  Database schema is managed in nimbus-cms repo (see SCHEMA_OWNERSHIP.md)"
