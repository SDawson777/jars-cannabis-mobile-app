/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.e2e.config.js',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      build: 'eas build --platform ios --profile development --local --wait',
      binaryPath: 'dist/jars-app-ios.app',
    },
    'android.debug': {
      type: 'android.apk',
      build: 'eas build --platform android --profile development --local --wait',
      binaryPath: 'dist/jars-app-android.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_XL_API_34' },
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
