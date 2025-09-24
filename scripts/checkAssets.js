/* eslint-env node */
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const { expectedAssets } = require('./expectedAssets');

const ASSETS_DIR = join(__dirname, '..', 'assets');

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full;
  });
}

const actualFiles = walk(ASSETS_DIR).map(p => p.split('/assets/')[1]);
const missing = expectedAssets.filter(need => !actualFiles.includes(need));

if (missing.length) {
  console.error(`\n❌  MISSING ASSETS (${missing.length})`);
  missing.forEach(m => console.error('   • ' + m));
  console.error('\nAdd the files above to /assets before shipping.\n');
  process.exit(1);
} else {
  if (process.env.DEBUG === 'true') {
    console.debug('✅  All spec assets are present. Good to go!');
  }
}
