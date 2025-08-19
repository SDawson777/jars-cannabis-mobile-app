const fs = require('fs');
const path = require('path');

function ensureTerminalReporterStub() {
  try {
    const metroPath = require.resolve('metro/package.json');
    const metroDir = path.dirname(metroPath);
    const targetDir = path.join(metroDir, 'src', 'lib');
    const targetFile = path.join(targetDir, 'TerminalReporter.js');
    if (!fs.existsSync(targetFile)) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(
        targetFile,
        `"use strict";
class TerminalReporter {
  constructor(terminal) { this.terminal = terminal || console; }
  update() {}
  _log() {}
  _updateState() {}
  _logWorkerChunk() {}
  _logWatcherStatus() {}
}
module.exports = TerminalReporter;
`
      );
      console.log('Created Metro TerminalReporter stub for Expo CLI.');
    }
  } catch (e) {
    console.warn('Skipping TerminalReporter stub:', e.message);
  }
}

function ensureImportLocationsPluginStub() {
  try {
    const metroPath = require.resolve('metro/package.json');
    const metroDir = path.dirname(metroPath);
    const targetDir = path.join(metroDir, 'src', 'ModuleGraph', 'worker');
    const targetFile = path.join(targetDir, 'importLocationsPlugin.js');
    if (!fs.existsSync(targetFile)) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(
        targetFile,
        `"use strict";
function importLocationsPlugin() { return {}; }
module.exports = importLocationsPlugin;
`
      );
      console.log('Created Metro importLocationsPlugin stub for Expo CLI.');
    }
  } catch (e) {
    console.warn('Skipping importLocationsPlugin stub:', e.message);
  }
}

ensureTerminalReporterStub();
ensureImportLocationsPluginStub();

