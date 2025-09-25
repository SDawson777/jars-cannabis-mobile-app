/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.e2e.config.js',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      build: 'expo build:ios --local --simulator',
      binaryPath: 'bin/jars-app-ios.app',
    },
    'android.debug': {
      type: 'android.apk',
      build: 'expo build:android --local --no-publish --clear-cache',
      binaryPath: 'bin/jars-app-android.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
