/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '<rootDir>/tests/custom-node-environment.js',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.jest.json', isolatedModules: true },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Integration tests require external services (Postgres via DATABASE_URL, and optionally Firebase).
  // Keep them opt-in so `npm run test:ci` is deterministic and green on a clean machine.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/integration/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__mocks__/**'],
  // Enforce a meaningful minimum coverage floor so regressions are caught,
  // while still reflecting the current measured baseline.
  coverageThreshold: { global: { branches: 20, functions: 14.5, lines: 20, statements: 20 } },
  // Mock modules that might cause issues in Node environment
  moduleNameMapper: {
    '^@react-native-firebase/(.*)$': '<rootDir>/tests/__mocks__/@react-native-firebase/$1.js',
    // Map any relative import depth (./prismaClient, ../prismaClient, ../../prismaClient, etc.)
    '^(?:\\.{1,2}\\/)+prismaClient$': '<rootDir>/tests/helpers/prismaMock.ts',
  },
};
