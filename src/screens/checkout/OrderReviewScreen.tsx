import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { Cart } from '../../hooks/useCart';

interface Props {
  cart: Cart | undefined;
  onPlaceOrder: () => void;
}

export default function OrderReviewScreen({ cart, onPlaceOrder }: Props) {
  const total = cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  return (
    <View style={styles.container}>
      {cart?.items.map(i => (
        <View key={i.id} style={styles.row}>
          <Text>{i.name}</Text>
          <Text>{i.quantity}×</Text>
        </View>
      ))}
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <Pressable onPress={onPlaceOrder} style={styles.button}>
        <Text style={styles.buttonText}>Place Order</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  total: { fontWeight: '600', marginVertical: 8 },
  button: { backgroundColor: '#2E5D46', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
