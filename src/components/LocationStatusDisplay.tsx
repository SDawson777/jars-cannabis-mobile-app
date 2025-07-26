import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';

interface Props {
  status: 'loading' | 'denied';
  onRetry(): void;
}

export default function LocationStatusDisplay({ status, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Locating nearest stores…</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.text}>Location permission denied.</Text>
      <Pressable onPress={onRetry} accessibilityRole="button">
        <Text style={styles.link}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12 },
  link: { color: '#2E5D46', marginTop: 12 },
});
