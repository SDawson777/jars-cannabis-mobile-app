// Mock for react-native's codegenNativeComponent to avoid Flow parsing issues in Jest
module.exports = function codegenNativeComponent(name) {
  return function Mocked() {
    return null;
  };
};
