// Built-in matchers from @testing-library/react-native (v12.4+)
import '@testing-library/react-native/extend-expect';

// Silence useNativeDriver warnings & Animated native helper
try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch {}

// Reanimated mock (v3-compatible)
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // Optional: keep animations disabled
  Reanimated.default.call = () => {};
  return Reanimated;
});

// If your code uses expo-constants or other Expo libs, you can add light mocks here:
// jest.mock('expo-constants', () => ({ default: { manifest: {} } }));
