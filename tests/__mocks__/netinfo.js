module.exports = {
  addEventListener: jest.fn(cb => {
    const unsub = () => {};
    // emulate returning an unsubscribe function (NetInfo v6 returns a fn)
    return unsub;
  }),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  isConnected: { addEventListener: jest.fn(), fetch: jest.fn(() => Promise.resolve(true)) },
  // for @react-native-community/netinfo v6+ default export
  __esModule: true,
  default: {
    addEventListener: jest.fn(cb => {
      const unsub = () => {};
      return unsub;
    }),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  },
};
