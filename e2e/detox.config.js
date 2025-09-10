/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.e2e.config.js',
  apps: { 'ios.debug': { type: 'ios.app', build: 'echo "stub build"', binaryPath: 'bin/ios.app' } },
  devices: { simulator: { type: 'ios.simulator', device: { type: 'iPhone 15' } } },
  configurations: { 'ios.sim.debug': { device: 'simulator', app: 'ios.debug' } },
};
