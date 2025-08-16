#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import fs from 'fs';

// 1. Env vars
['GC_PROJECT_ID', 'GC_CLIENT_EMAIL', 'GC_PRIVATE_KEY'].forEach(k => {
  if (!process.env[k]) {
    console.error(`❌ Missing ${k} in backend/.env`);
    process.exit(1);
  }
});

// 2. Config files
['apps/ios/GoogleService-Info.plist', 'apps/android/google-services.json'].forEach(p => {
  if (!fs.existsSync(p)) {
    console.error(`❌ Missing ${p}`);
    process.exit(1);
  }
});

// 3. Lint rules
execSync('firebase firestore:rules:test', { stdio: 'inherit' });

// 4. Emulators smoke-test
execSync('npm run test:e2e:firebase', { stdio: 'inherit' });

if (process.env.DEBUG === 'true') {
  console.debug('✅ Firebase setup looks solid.');
}
