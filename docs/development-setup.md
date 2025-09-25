# Development Setup

## E2E Testing with Detox

### CI Environment (GitHub Actions)

E2E tests run automatically in CI using GitHub Actions with a provisioned Android emulator. The workflow:

- Installs Android SDK and tools
- Creates and starts Pixel_7_API_34 emulator
- Builds the app for E2E testing
- Starts the backend server
- Runs Detox smoke tests

### Local Development

E2E testing locally requires Android SDK installation:

#### Prerequisites

1. **Android Studio** or **Android SDK Command Line Tools**
2. **ANDROID_HOME** environment variable pointing to SDK location
3. **Java 17** (required by Android build tools)

#### Setup Steps

```bash
# 1. Install Android SDK (if using command line tools)
# Download from: https://developer.android.com/studio#cmdline-tools

# 2. Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk  # or your SDK path
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Install system image and create AVD
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "system-images;android-34;google_apis;x86_64"
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd --force --name "Pixel_7_API_34" --device "pixel_xl" --package "system-images;android-34;google_apis;x86_64"

# 4. Verify setup
$ANDROID_HOME/emulator/emulator -list-avds  # Should show Pixel_7_API_34

# 5. Run E2E tests
npm run build:e2e:android
npm run test:e2e:android
```

#### Alternative: Use GitHub Actions for E2E Testing

If local Android setup is complex, rely on the automated CI workflow:

- Push changes to a branch
- Create PR to trigger E2E tests in CI
- Monitor workflow results in GitHub Actions tab

### Dev Container Limitations

The current dev container environment does not include Android SDK tools. This is intentional to keep the container lightweight, as E2E testing is primarily handled in CI.

### Troubleshooting

#### Common AVD Issues

**"Unknown AVD name" error:**

- Verify AVD was created: `$ANDROID_HOME/emulator/emulator -list-avds`
- List available device profiles: `$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list device`
- Recreate AVD with different device profile if needed

**AVD creation fails:**

- Ensure system image is installed: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list`
- Try using a different device profile like "pixel_xl" or omit the `--device` parameter
- Check available devices: `$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list device`

**Emulator won't start:**

- Ensure hardware acceleration is available (Intel HAXM or AMD-V)
- Try adding `-no-accel` flag for software-only emulation
- Check disk space and RAM requirements
