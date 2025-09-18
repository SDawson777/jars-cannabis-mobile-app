// Simple mock replacement for react-native/jest/mockNativeComponent
module.exports = function mockNativeComponent(name) {
  return function MockNativeComponent() {
    return null;
  };
};
