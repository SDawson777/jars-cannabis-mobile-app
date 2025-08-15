/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/e2e/',                 // run Detox separately
    '<rootDir>/tests/awards.redeem.test.ts' // Prisma/integration test (node env)
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|react-native-reanimated'
      + '|@react-native-async-storage'
      + '|react-native-haptic-feedback'
      + '|@aws-amplify'
      + '|@react-navigation'
      + '|@react-native-async-storage'
      + '|@expo(nent)?/.*'
      + '|expo(nent)?/.*'
      + '|expo-modules-core'
      + '|expo-haptics'
      + '|expo-secure-store'
      + '|unimodules-.*'
      + '|native-base'
      + ')/)',
  ],
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '\\.(png|jpg|jpeg|gif|webp)$': '<rootDir>/tests/__mocks__/svgMock.js',
    '^@aws-amplify/react-native$': '<rootDir>/tests/__mocks__/emptyModule.js'
  },
  // Make sure TS/TSX are handled through Babel (via jest-expo preset)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
