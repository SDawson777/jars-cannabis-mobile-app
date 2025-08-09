// eslint.config.js
const js = require('@eslint/js');
const jsoncPlugin = require('eslint-plugin-jsonc');
const jsoncParser = require('jsonc-eslint-parser');
const typescript = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactNative = require('eslint-plugin-react-native');
const prettier = require('eslint-plugin-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-native': reactNative,
      prettier,
    },
    rules: {
      // React/React Native
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react-native/no-inline-styles': 'warn',
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'warn', // Also warn for vanilla JS
      // Formatting
      'prettier/prettier': 'error',
      // General
      'no-undef': 'off',
    },
  },
  {
    files: ['*.json', '*.json5', '*.jsonc'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsoncPlugin,
    },
    rules: {
      'jsonc/no-dupe-keys': 'error',
      'jsonc/no-floating-decimal': 'error',
      'jsonc/no-irregular-whitespace': 'error',
      'jsonc/no-octal-escape': 'error',
      'jsonc/no-sparse-arrays': 'error',
      'jsonc/no-useless-escape': 'error',
      'jsonc/valid-json-number': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      'android/',
      'ios/',
      'build/',
      'dist/',
      'coverage/',
      'backend/',
      'functions/',
      '.eslintrc.js',
      'jest.config.js',
      'eslint.config.js',
      'package-lock.json',
    ],
  },
];
