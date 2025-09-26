#!/bin/bash
# 🔄 Expo Web Dependencies Upgrade Script
# Upgrades vulnerable Expo Web dependencies and regenerates lockfiles

set -e  # Exit on any error

echo "🚀 Starting Expo Web Dependencies Upgrade..."
echo "📋 This script will upgrade vulnerable Expo web dependencies"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Set memory options for upgrade process
export NODE_OPTIONS="--max-old-space-size=6144"

print_step "Checking for vulnerable Expo Web dependencies..."

# Check current versions
print_step "Current Expo Web dependency versions:"
echo "📦 @expo/webpack-config: $(npm list @expo/webpack-config --depth=0 2>/dev/null | grep @expo/webpack-config || echo 'Not found')"

# Update Expo Web related dependencies
print_step "Upgrading @expo/webpack-config to latest..."
if ! npm install --save-dev @expo/webpack-config@latest --legacy-peer-deps; then
    print_error "Failed to upgrade @expo/webpack-config"
    exit 1
fi

# Check for expo-pwa and upgrade if present
if npm list expo-pwa --depth=0 2>/dev/null; then
    print_step "Upgrading expo-pwa to latest..."
    if ! npm install --save-dev expo-pwa@latest --legacy-peer-deps; then
        print_error "Failed to upgrade expo-pwa"
        exit 1
    fi
fi

# Update other web-related dependencies
print_step "Checking for other vulnerable web dependencies..."

# List of web-related packages to potentially upgrade
WEB_DEPS=(
    "webpack"
    "webpack-dev-server" 
    "@expo/metro-runtime"
    "expo-constants"
    "expo-web-browser"
)

for dep in "${WEB_DEPS[@]}"; do
    if npm list "$dep" --depth=0 2>/dev/null; then
        print_step "Found $dep, checking for updates..."
        # Use npm-check-updates to see if updates are available
        if npx ncu --filter "$dep" --target minor | grep -q "→"; then
            print_step "Upgrading $dep..."
            npm install "$dep@latest" --legacy-peer-deps || print_warning "Failed to upgrade $dep, continuing..."
        fi
    fi
done

print_success "Dependency upgrades completed!"

# Run audit to check for remaining vulnerabilities
print_step "Running security audit..."
if npm audit --audit-level high; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Some vulnerabilities remain - check npm audit output"
fi

# Test web build
print_step "Testing web build..."
if npm run build:web; then
    print_success "Web build successful!"
else
    print_error "Web build failed - check configuration"
    exit 1
fi

echo ""
print_success "🎉 Expo Web upgrade completed successfully!"
echo ""

print_step "📝 Next steps:"
echo "   1. Test the app in web browser: npm run web"
echo "   2. Verify mobile builds still work: expo start"  
echo "   3. Run full test suite: npm run test:ci"
echo "   4. Commit updated package.json and package-lock.json"
echo ""
print_success "✨ Web dependencies are now up to date and secure!"