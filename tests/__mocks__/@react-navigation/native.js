const React = require('react');

// Simple mock NavigationContainer passthrough
function NavigationContainer({ children }) {
  // Return children directly inside a Fragment to preserve mounting for
  // renderHook wrappers used by tests.
  return React.createElement(React.Fragment, null, children);
}

// useNavigation hook returns an object with common navigation APIs used in tests
function useNavigation() {
  return {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  };
}

module.exports = {
  NavigationContainer,
  useNavigation,
};
