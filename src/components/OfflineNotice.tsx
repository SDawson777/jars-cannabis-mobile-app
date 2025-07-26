import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export default function OfflineNotice() {
  const netInfo = useNetInfo();
  if (netInfo.isConnected === false) {
    return (
      <View style={styles.banner}>
        <Text style={styles.text}>Offline Mode</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f44336',
    paddingVertical: 4,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 12 },
});
