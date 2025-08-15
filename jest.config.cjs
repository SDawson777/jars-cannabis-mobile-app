/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|react-native-reanimated'
      + '|@react-navigation'
      + '|@react-native-async-storage'
      + '|@expo(nent)?/.*'
      + '|expo(nent)?/.*'
      + '|expo-modules-core'
      + '|unimodules-.*'
      + '|native-base'
      + ')/)',
  ],
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '\\.(png|jpg|jpeg|gif|webp)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '\\.(mp3|wav|mp4)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^expo$': '<rootDir>/tests/__mocks__/expo.js',
    '^expo-linking$': '<rootDir>/tests/__mocks__/expo-linking.js',
    '^expo-constants$': '<rootDir>/tests/__mocks__/expo-constants.js',
  },
  // Make sure TS/TSX are handled through Babel (via jest-expo preset)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
