import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface Props {
  message: string;
  onSwitchStore: () => void;
  loading?: boolean;
}

export default function ErrorCard({ message, onSwitchStore }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <Pressable onPress={onSwitchStore} style={styles.button}>
        <Text style={styles.buttonText}>Switch Store</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: { fontSize: 14, marginBottom: 8 },
  button: {
    backgroundColor: '#2E5D46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
