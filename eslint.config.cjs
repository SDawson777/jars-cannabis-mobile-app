const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const importPlugin = require('eslint-plugin-import');
const jest = require('eslint-plugin-jest');
const testingLibrary = require('eslint-plugin-testing-library');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}', 'store/**/*.{ts,tsx,js,jsx}', 'stores/**/*.{ts,tsx,js,jsx}', 'tests/**/*.{ts,tsx,js,jsx}', 'jest.setup.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        __DEV__: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      import: importPlugin,
      jest,
      'testing-library': testingLibrary
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          '**/*.test.*',
          '**/__tests__/**',
          'jest*.{cjs,js,ts}',
          'jest.setup.ts',
          'tests/**'
        ]
      }],
      'react-native/no-inline-styles': 'off',
      'react-native/no-raw-text': 'off'
    }
  },
  {
    files: ['**/*.test.*', '**/__tests__/**', 'jest.setup.ts'],
    plugins: {
      jest,
      'testing-library': testingLibrary
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'testing-library/no-unnecessary-act': 'off',
      'testing-library/no-await-sync-events': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', 'scripts/**/*.ts', 'config/**/*.ts', 'webpack.config.js', 'tailwind.config.js', 'babel.config.js', 'App.tsx', 'config/firebaseClient.ts', 'scripts/checkAssets.ts', 'tasks/locationWatcher.ts', 'tests/firebase.e2e.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    ignores: [
      'dist/',
      'build/',
      'out/',
      '.next/',
      '.nucrt/',
      '.nuxt/',
      '.storybook/',
      'coverage/',
      '.eslintcache',
      '.vscode/',
      '.tmp/',
      '.temp/',
      '.parcel-cache/',
      '.vite/',
      '.turbo/',
      'node_modules/',
      'android/',
      'ios/DerivedData/',
      'assets/splash/',
      'src/terpene_wheel/snippets/',
      'backend/',
      'functions/',
      'server/',
      'apps/'
    ]
  }
];
