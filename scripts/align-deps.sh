#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_PKG="package.json"
BACKEND_DIR="backend"
REPORT=".peer-conflicts.txt"
NPU_VERSION="${NPU_VERSION:-16}"

command -v npx >/dev/null || { echo "npx is required; install Node/npm"; exit 1; }

echo "1/5 → Running npm-check-updates (minor/patch) for root..."
npx --yes npm-check-updates@"$NPU_VERSION" -u --target minor --packageFile "$ROOT_PKG"

if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
  echo "2/5 → Running npm-check-updates (minor/patch) for backend..."
  npx --yes npm-check-updates@"$NPU_VERSION" -u --target minor --packageFile "$BACKEND_DIR/package.json"
fi

echo "3/5 → Installing dependencies (using --legacy-peer-deps)..."
npm install --legacy-peer-deps

if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
  (cd "$BACKEND_DIR" && npm install --legacy-peer-deps) || true
fi

echo "4/5 → Collecting dependency tree and peer issues..."
rm -f .npm-ls.json "$REPORT"
npm ls --all --json > .npm-ls.json 2>/dev/null || true

node <<'NODE' || true
const fs = require('fs');
const path = '.npm-ls.json';
const outFile = process.env.REPORT || '.peer-conflicts.txt';
let out = [];
try {
  if (!fs.existsSync(path)) {
    out.push('npm ls output not available; installation may have failed.');
  } else {
    const j = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (Array.isArray(j.problems) && j.problems.length) {
      out.push('Problems reported by npm ls:');
      j.problems.forEach(p => out.push('- ' + p));
    }
    function inspectNode(node, pname) {
      if (!node) return;
      if (node.peerMissing && node.peerMissing.length) {
        out.push(`Missing peers for ${pname}: ${node.peerMissing.join(', ')}`);
      }
      if (node.invalidPeerDependencies) {
        const ip = node.invalidPeerDependencies;
        const keys = Object.keys(ip);
        if (keys.length) {
          out.push(`Invalid peer deps for ${pname}:`);
          keys.forEach(k => out.push(`  - ${k}: ${JSON.stringify(ip[k])}`));
        }
      }
      if (node.dependencies) {
        Object.entries(node.dependencies).forEach(([n, v]) => inspectNode(v, `${pname} > ${n}`));
      }
    }
    inspectNode(j, j.name || 'root');
    if (out.length === 0) out.push('No top-level unmet peer dependency entries detected by npm ls.');
  }
} catch (e) {
  out = ['Failed to parse npm ls JSON: ' + e.message];
}
fs.writeFileSync(outFile, out.join('\n'), 'utf8');
console.log('Wrote peer conflict summary to:', outFile);
NODE

echo "5/5 → Quick validation (lint/typecheck/tests if present)..."
npm run lint --if-present || true
npx --yes tsc --noEmit --skipLibCheck || true
npm test --if-present || true

echo ""
echo "Done. Inspect $REPORT for conflicts and resolve critical peer issues manually (overrides/resolutions or pinning)."