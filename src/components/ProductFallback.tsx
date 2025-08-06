import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onRetry: () => void;
  loading?: boolean;
}

export default function ProductFallback({ onRetry, loading }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Unavailable</Text>
      <Text style={styles.subtitle}>Try switching stores or check back later.</Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onRetry();
        }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Retry</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  button: {
    backgroundColor: '#2E5D46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: '500' },
});
