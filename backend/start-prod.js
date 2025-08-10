/**
 * Minimal launcher for the compiled backend.
 * Tries backend/dist/server/index.js, then backend/dist/index.js.
 * Keeps process alive as long as the HTTP server runs.
 */
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'dist', 'server', 'index.js'),
  path.join(__dirname, 'dist', 'index.js'),
];

for (const p of candidates) {
  if (fs.existsSync(p)) {
    console.log('[start] launching', p);
    require(p);
    return;
  }
}

console.error('[start] No backend entry found in dist/. Did you run `npm run build:backend`?');
process.exit(1);
