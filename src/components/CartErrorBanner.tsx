import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface Props {
  onRetry: () => void;
}

export default function CartErrorBanner({ onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Unable to sync cart.</Text>
      <Pressable onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEB',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { color: '#B00020', fontSize: 12 },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#B00020',
    borderRadius: 4,
  },
  buttonText: { color: '#fff', fontSize: 12 },
});
