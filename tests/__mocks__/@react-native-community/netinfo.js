// Simple mock of @react-native-community/netinfo for Jest tests
function useNetInfo() {
  // default to connected
  return { isConnected: true };
}

module.exports = { useNetInfo };
