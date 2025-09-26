# 📦 Dependency Setup Instructions

## Overview
This document outlines the remaining dependency installation steps that need to be completed in an environment with sufficient memory (8GB+ recommended).

## Current Status
- ✅ **Node.js Version**: Pinned to 20.11.1 across all package.json files
- ✅ **Package Manager**: Configured for npm-only workflow  
- ✅ **Memory Optimization**: Added NODE_OPTIONS flags to all GitHub workflows
- ✅ **ESLint Fix**: Added minimatch override to resolve import/no-extraneous-dependencies error
- ⚠️ **Dependencies**: Need installation with proper memory allocation

## Required Steps

### 1. Install Root Dependencies
```bash
cd /workspaces/jars-cannabis-mobile-app
NODE_OPTIONS="--max-old-space-size=6144" npm install --legacy-peer-deps
```

### 2. Install Backend Dependencies  
```bash
cd backend
NODE_OPTIONS="--max-old-space-size=4096" npm install --legacy-peer-deps
```

### 3. Install Functions Dependencies
```bash
cd functions  
NODE_OPTIONS="--max-old-space-size=4096" npm install --legacy-peer-deps
```

### 4. Install Demo Web Dependencies
```bash
cd apps/demo-web
NODE_OPTIONS="--max-old-space-size=4096" npm install
```

### 5. Verify Quality Gates
After successful installation, verify all systems work:

```bash
# ESLint (should resolve original minimatch error)
npm run lint

# TypeScript compilation
npm run typecheck

# Unit tests
npm run test:ci

# Code formatting
npm run format:ci

# Backend checks
cd backend
npm run typecheck
npm run test:ci
```

### 6. Commit Generated Lockfiles
```bash
git add package-lock.json backend/package-lock.json functions/package-lock.json apps/demo-web/package-lock.json
git commit -m "Add generated package-lock.json files for deterministic builds

- Ensures CI doesn't need to resolve peer dependencies from scratch
- Prevents memory exhaustion during dependency resolution in CI
- Locks all package versions for reproducible builds across environments"
```

## Troubleshooting

### Memory Errors
If you encounter memory errors during installation:
- Increase NODE_OPTIONS to `--max-old-space-size=8192` 
- Close other applications to free system memory
- Use `npm ci` instead of `npm install` after lockfiles are generated

### Peer Dependency Conflicts  
- Use `--legacy-peer-deps` flag for React Native compatibility
- The minimatch override should resolve ESLint plugin conflicts
- If issues persist, check the overrides section in package.json

### CI Failures
After completing local setup:
- Push the lockfiles to trigger CI builds
- Monitor GitHub Actions for memory-related failures  
- The NODE_OPTIONS flags should prevent most memory issues

## Expected Outcomes

After completing these steps:
1. **ESLint**: Original `(0, _minimatch2.default) is not a function` error should be resolved
2. **CI Stability**: GitHub Actions should complete without memory exhaustion
3. **Expo/Android**: E2E tests should have proper dependencies for emulator setup
4. **Deterministic Builds**: Lockfiles ensure consistent dependency resolution

## Quality Gate Verification

All of these must pass before considering the setup complete:
- [ ] `npm run lint` (no ESLint errors)
- [ ] `npm run typecheck` (TypeScript compilation succeeds)  
- [ ] `npm run test:ci` (unit tests pass)
- [ ] `npm run format:ci` (code formatting consistent)
- [ ] Backend tests pass (if configured)
- [ ] GitHub Actions workflows complete successfully