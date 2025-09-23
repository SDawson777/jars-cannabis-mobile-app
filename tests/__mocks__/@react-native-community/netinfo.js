// Simple mock of @react-native-community/netinfo for Jest tests
function useNetInfo() {
  // default to connected
  return { isConnected: true };
}

// Provide a default export shape similar to the real library and a fetch/addEventListener helpers
const fetch = jest.fn().mockResolvedValue({ isConnected: true });

const addEventListener = jest.fn(cb => {
  // call immediately with connected state to mimic environment
  try {
    cb({ isConnected: true });
  } catch (e) {
    // ignore
  }
  // return unsubscribe
  return () => {};
});

module.exports = { useNetInfo, fetch, addEventListener };
