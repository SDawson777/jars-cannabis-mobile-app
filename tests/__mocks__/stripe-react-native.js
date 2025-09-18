const React = require('react');

// Minimal mock of stripe-react-native used in tests.
module.exports = {
  useStripe: () => ({
    initPaymentSheet: jest.fn(() => Promise.resolve({})),
    presentPaymentSheet: jest.fn(() => Promise.resolve({})),
    confirmPayment: jest.fn(() => Promise.resolve({})),
  }),
  isPlatformPaySupported: jest.fn(() => Promise.resolve(false)),
  // Expose common utility functions if needed
  PaymentSheet: {},
};
