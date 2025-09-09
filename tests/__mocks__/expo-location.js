module.exports = {
  requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  requestBackgroundPermissionsAsync: async () => ({ status: 'granted' }),
  getCurrentPositionAsync: async () => ({ coords: { latitude: 0, longitude: 0 } }),
};
