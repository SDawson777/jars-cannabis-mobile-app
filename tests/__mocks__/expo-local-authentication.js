// Minimal mock for expo-local-authentication used in Jest tests
const AuthenticationType = {
  FACIAL_RECOGNITION: 1,
  FINGERPRINT: 2,
};

const hasHardwareAsync = jest.fn(async () => true);
const isEnrolledAsync = jest.fn(async () => true);
const supportedAuthenticationTypesAsync = jest.fn(async () => [AuthenticationType.FINGERPRINT]);
const authenticateAsync = jest.fn(async (opts = {}) => ({ success: true }));

module.exports = {
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
  authenticateAsync,
};

module.exports.default = module.exports;
