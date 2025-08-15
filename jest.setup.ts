// Built-in matchers for RTL (prefer new entry; fallback to deprecated jest-native)
try {
  // RTL v12.4+ exposes this
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('@testing-library/react-native/extend-expect');
} catch {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    require('@testing-library/jest-native/extend-expect');
  } catch {
    // no-op; tests can still run without extended matchers
  }
}

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

// --- Native/Expo module mocks for Jest ---
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
}));

jest.mock('@aws-amplify/analytics', () => ({
  record: jest.fn(),
}));
