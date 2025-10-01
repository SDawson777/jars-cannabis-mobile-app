#!/usr/bin/env bash
set -euo pipefail

# uploads app-release.apk to Appetize.io using APPETIZE_API_TOKEN env var
# Writes PUBLIC_KEY to .appetize.env and prints dashboard/embed links

if [ ! -f app-release.apk ]; then
  echo "ERROR: app-release.apk not found in the current directory."
  echo "Please place the built APK at ./app-release.apk or run the EAS build step first."
  exit 2
fi

if [ -z "${APPETIZE_API_TOKEN:-}" ]; then
  echo "ERROR: APPETIZE_API_TOKEN environment variable is not set."
  echo "Set it with: export APPETIZE_API_TOKEN=your_token_here"
  exit 3
fi

echo "Uploading app-release.apk to Appetize..."
RESPONSE=$(curl -sS https://api.appetize.io/v1/apps \
  -u "${APPETIZE_API_TOKEN}:" \
  -F "file=@app-release.apk" \
  -F "platform=android")

# Pretty-print the raw response for debugging
echo "Response from Appetize:"
echo "$RESPONSE" | jq . || echo "$RESPONSE"

PUB=$(echo "$RESPONSE" | jq -r '.publicKey // .data.publicKey // .app.publicKey // empty')

if [ -n "$PUB" ]; then
  echo "\nUpload succeeded. Public key: $PUB"
  echo "Dashboard: https://appetize.io/app/$PUB"
  echo "Embed: https://appetize.io/embed/$PUB?device=pixel7&osVersion=14.0&scale=75&autoplay=true"
  echo "PUBLIC_KEY=$PUB" > .appetize.env
  echo "Wrote .appetize.env with PUBLIC_KEY."
  exit 0
else
  echo "\nUpload completed but no public key found in response. Full response above for debugging."
  exit 4
fi
