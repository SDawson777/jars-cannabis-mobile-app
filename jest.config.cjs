/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Use jsdom environment for react-native component tests
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // Allow transforming important react-native, expo and related modules inside node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|@react-navigation|@react-native-async-storage|@expo|expo|expo-modules-core|unimodules-.*|native-base|@react-navigation|@testing-library)/)'
  ],
  moduleNameMapper: {
  '^react-native$': '<rootDir>/tests/__mocks__/react-native.js',
  '^@prisma/client$': '<rootDir>/tests/__mocks__/@prisma/client.js',
  '^@react-navigation/native$': '<rootDir>/tests/__mocks__/@react-navigation/native.js',
  '^@react-native-community/netinfo$': '<rootDir>/tests/__mocks__/netinfo.js',
  '^lottie-react-native$': '<rootDir>/tests/__mocks__/lottie-react-native.js',
  '^react-native/jest/mockNativeComponent$': '<rootDir>/tests/__mocks__/mockNativeComponent.js',
  '^react-native-haptic-feedback$': '<rootDir>/tests/__mocks__/react-native-haptic-feedback.js',
  '^expo-localization$': '<rootDir>/tests/__mocks__/expo-localization.js',
  '^expo-location$': '<rootDir>/tests/__mocks__/expo-location.js',
    '\\.(svg)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '\\.(png|jpg|jpeg|gif|webp)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '\\.(mp3|wav|mp4)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^expo$': '<rootDir>/tests/__mocks__/expo.js',
    '^expo-linking$': '<rootDir>/tests/__mocks__/expo-linking.js',
    '^expo-constants$': '<rootDir>/tests/__mocks__/expo-constants.js',
  '^react-native/jest/mock$': '<rootDir>/tests/__mocks__/reactNativeMock.js',
  '^react-native/jest/mock.js$': '<rootDir>/tests/__mocks__/reactNativeMock.js',
  '^react-native/jest/mock.*': '<rootDir>/tests/__mocks__/reactNativeMock.js',
  '^react-native/jest/setup$': '<rootDir>/tests/__mocks__/reactNativeSetup.js',
  '^react-native/jest/setup.js$': '<rootDir>/tests/__mocks__/reactNativeSetup.js',
  '^react-native/jest/.*': '<rootDir>/tests/__mocks__/reactNativeMock.js',
  },
  // Ignore end-to-end and platform-specific tests in unit test runs
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  // Make sure TS/TSX are handled through Babel (via jest-expo preset)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
