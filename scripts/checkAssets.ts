/* eslint-env node */
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { expectedAssets } from './expectedAssets';

const ASSETS_DIR = join(__dirname, '..', 'assets');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full;
  });
}

const actualFiles = walk(ASSETS_DIR).map(p => p.split('/assets/')[1]);
const missing = expectedAssets.filter(need => !actualFiles.includes(need));

if (missing.length) {
  console.error(`\n\u274C  MISSING ASSETS (${missing.length})`);
  missing.forEach(m => console.error('   \u2022 ' + m));
  console.error('\nAdd the files above to /assets before shipping.\n');
  process.exit(1);
} else {
  if (process.env.DEBUG === 'true') {
    console.debug('\u2705  All spec assets are present. Good to go!');
  }
}
