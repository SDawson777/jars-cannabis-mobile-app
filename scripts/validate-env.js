#!/usr/bin/env node
// Simple env validation script to help CI ensure no sensitive vars are client-exposed.
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content
      .split(/\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.split('=')[0]);
  } catch {
    return [];
  }
}

const root = path.resolve(__dirname, '..');
const example = path.join(root, '.env.example');
const envKeys = loadEnv(example);

// Patterns that look like secrets - if used with EXPO_PUBLIC_ prefix, warn/fail
const secretIndicators = ['SECRET', 'KEY', 'PRIVATE', 'TOKEN', 'PASSWORD'];

// Allowlist of EXPO_PUBLIC_ keys that are intentionally public (Firebase client keys, Stripe publishable, brand info)
const allowlist = new Set([
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_FIREBASE_MEASUREMENTID',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_STRIPE_MERCHANT_ID',
  'EXPO_PUBLIC_BRAND_NAME',
  'EXPO_PUBLIC_BRAND_SLUG',
  // OpenWeather is commonly used client-side but may be sensitive depending on rate limits
  'EXPO_PUBLIC_OPENWEATHER_KEY',
]);

const bad = envKeys.filter(k => {
  if (!k.startsWith('EXPO_PUBLIC_')) return false;
  if (allowlist.has(k)) return false;
  const rest = k.replace(/^EXPO_PUBLIC_/, '').toUpperCase();
  return secretIndicators.some(ind => rest.includes(ind));
});

if (bad.length) {
  console.error(
    'ERROR: The following EXPO_PUBLIC_ keys look like secrets and should not be client-exposed:'
  );
  for (const k of bad) console.error('- ' + k);
  console.error(
    '\nIf these are truly public, you can ignore this. Otherwise move them to server-side env variables.'
  );
  process.exit(2);
}

console.log('Env example validation passed.');
process.exit(0);
