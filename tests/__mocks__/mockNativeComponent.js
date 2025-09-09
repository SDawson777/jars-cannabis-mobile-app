// Simple stub to satisfy react-native's mockNativeComponent usage in tests
module.exports = function mockNativeComponent(name) {
  return () => null;
};
