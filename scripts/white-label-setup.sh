#!/usr/bin/env bash
# White-label setup script
# Usage: npm run white-label:setup

set -e

echo "🎨 White-Label Setup for Nimbus Cannabis OS"
echo "============================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please copy .env.example to .env first."
  exit 1
fi

# Source env vars
set -a
source .env
set +a

BRAND_NAME="${EXPO_PUBLIC_BRAND_NAME:-Nimbus Cannabis OS}"
BRAND_SLUG="${EXPO_PUBLIC_BRAND_SLUG:-nimbus-cannabis-mobile}"

echo "📝 Current Configuration:"
echo "  Brand Name: $BRAND_NAME"
echo "  Brand Slug: $BRAND_SLUG"
echo ""

# Update app.config.ts
echo "✏️  Updating app.config.ts..."
# This is a placeholder - in production, use sed or a more robust tool
echo "  ⚠️  Manual step: Update 'name' and 'slug' fields in app.config.ts"
echo "     name: '$BRAND_NAME'"
echo "     slug: '$BRAND_SLUG'"
echo ""

# Asset directory setup
ASSET_DIR="assets/$BRAND_SLUG"
if [ ! -d "$ASSET_DIR" ]; then
  echo "📁 Creating asset directory: $ASSET_DIR"
  mkdir -p "$ASSET_DIR"
  
  # Copy default assets as templates
  if [ -d "assets/nimbus" ]; then
    echo "📋 Copying default assets as templates..."
    cp -r assets/nimbus/* "$ASSET_DIR/"
  fi
  
  echo ""
  echo "✅ Asset directory created!"
  echo "   Please replace the following files with your brand assets:"
  echo "   - $ASSET_DIR/nimbus-icon.png (1024x1024)"
  echo "   - $ASSET_DIR/nimbus-splash.png (1284x2778 for iOS)"
  echo "   - $ASSET_DIR/logo.png"
else
  echo "✅ Asset directory already exists: $ASSET_DIR"
fi

echo ""
echo "🔧 Bundle Identifiers"
echo "   iOS: com.${BRAND_SLUG}.ios"
echo "   Android: com.${BRAND_SLUG}.android"
echo "   ⚠️  Manual step: Update bundleIdentifier/package in app.config.ts"

echo ""
echo "📱 Next Steps:"
echo "1. Update strings in src/locales/en.json"
echo "2. Replace brand assets in $ASSET_DIR/"
echo "3. Update app.config.ts with your bundle IDs"
echo "4. Run: npx expo prebuild --clean"
echo "5. Test: npm run ios / npm run android"
echo ""
echo "✨ White-label setup complete!"
