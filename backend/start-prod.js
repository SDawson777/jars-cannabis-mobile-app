/**
 * Minimal launcher for the compiled backend.
 * Tries backend/dist/server/index.js, then backend/dist/index.js.
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
    process.once('uncaughtException', e => console.error('[start] uncaught:', e));
    process.once('unhandledRejection', e => console.error('[start] unhandled:', e));
    return;
  }
}

console.error('[start] No backend entry found in dist/. Did you run `npm run build`?');
process.exit(1);
