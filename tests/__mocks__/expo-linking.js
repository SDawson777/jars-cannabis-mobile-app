module.exports = {
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  getInitialURL: () => Promise.resolve(null),
  openURL: () => Promise.resolve(),
};
