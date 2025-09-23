import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, TextInput } from 'react-native';

interface Props {
  onNext: (__method: { type: 'pickup' | 'delivery'; address?: string }) => void;
}

export default function DeliveryMethodScreen({ onNext }: Props) {
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setMethod('pickup')}
          style={[styles.option, method === 'pickup' && styles.selected]}
        >
          <Text>Pickup</Text>
        </Pressable>
        <Pressable
          onPress={() => setMethod('delivery')}
          style={[styles.option, method === 'delivery' && styles.selected]}
        >
          <Text>Delivery</Text>
        </Pressable>
      </View>
      {method === 'delivery' && (
        <TextInput
          placeholder="Address"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      )}
      <Pressable onPress={() => onNext({ type: method, address })} style={styles.button}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', marginBottom: 16 },
  option: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
  },
  selected: { backgroundColor: '#E5F4EF', borderColor: '#2E5D46' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: { backgroundColor: '#2E5D46', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
