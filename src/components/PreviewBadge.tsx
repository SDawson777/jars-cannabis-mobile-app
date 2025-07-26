import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PreviewBadge() {
  return (
    <View style={styles.badge} accessibilityRole="text" accessibilityLabel="Preview mode">
      <Text style={styles.text}>Preview Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2E5D46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});
