#!/usr/bin/env bash
set -euo pipefail

# White-label asset replacement helper
# Copies brand-provided assets into the app's expected paths.
# Usage:
#   scripts/white-label-assets.sh /path/to/brand-assets
# Expected files in the source directory:
#   icon.png            -> app icon
#   splash.png          -> splash screen image
# Optional files:
#   logo.png            -> light logo
#   logo-dark.png       -> dark logo
#   onboarding-1.png
#   onboarding-2.png
#   onboarding-3.png

SRC_DIR=${1:-}
if [[ -z "$SRC_DIR" ]]; then
  echo "Usage: $0 /path/to/brand-assets" >&2
  exit 1
fi
if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: Source directory '$SRC_DIR' not found" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
ASSETS_DIR="$ROOT_DIR/assets/nimbus"
mkdir -p "$ASSETS_DIR"

copy_if_exists() {
  local src="$1"; shift
  local dest="$1"; shift
  if [[ -f "$src" ]]; then
    cp "$src" "$dest"
    echo "Updated $(basename "$dest")"
  else
    echo "Skipped $(basename "$dest") (missing: $(basename "$src"))"
  fi
}

# Required assets
copy_if_exists "$SRC_DIR/icon.png" "$ASSETS_DIR/nimbus-icon.png"
copy_if_exists "$SRC_DIR/splash.png" "$ASSETS_DIR/nimbus-splash.png"

# Optional assets
copy_if_exists "$SRC_DIR/logo.png" "$ASSETS_DIR/nimbus-logo.png"
copy_if_exists "$SRC_DIR/logo-dark.png" "$ASSETS_DIR/nimbus-logo-dark.png"
copy_if_exists "$SRC_DIR/onboarding-1.png" "$ASSETS_DIR/onboarding-1.png"
copy_if_exists "$SRC_DIR/onboarding-2.png" "$ASSETS_DIR/onboarding-2.png"
copy_if_exists "$SRC_DIR/onboarding-3.png" "$ASSETS_DIR/onboarding-3.png"

echo "White-label asset update complete."
