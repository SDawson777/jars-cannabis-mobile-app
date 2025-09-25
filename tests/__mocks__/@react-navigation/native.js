const React = require('react');

// Global mock params that can be overridden per test
let mockRouteParams = {
  item: {
    id: 'test-product-123',
    name: 'Test Cannabis Product',
    slug: 'test-cannabis-product',
  },
  journalEntry: undefined,
};

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

// useRoute hook returns an object with params for testing
function useRoute() {
  return {
    params: mockRouteParams,
  };
}

// Helper to set mock params for tests
function __setMockRouteParams(params) {
  mockRouteParams = params;
}

// Helper to reset mock params
function __resetMockRouteParams() {
  mockRouteParams = {
    item: {
      id: 'test-product-123',
      name: 'Test Cannabis Product',
      slug: 'test-cannabis-product',
    },
    journalEntry: undefined,
  };
}

module.exports = {
  NavigationContainer,
  useNavigation,
  useRoute,
  __setMockRouteParams,
  __resetMockRouteParams,
};
