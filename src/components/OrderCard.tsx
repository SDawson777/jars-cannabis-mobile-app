import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

import type { Order } from '../types/order';

interface Props {
  order: Order;
  onPress(): void;
  primaryColor: string;
  secondaryColor: string;
}

export default function OrderCard({ order, onPress, primaryColor, secondaryColor }: Props) {
  const date = new Date(order.createdAt).toLocaleDateString();
  const label = `Order ${order.id} on ${date} at ${order.store} totaling $${order.total.toFixed(
    2
  )}`;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View>
        <Text style={[styles.id, { color: primaryColor }]}>Order #{order.id}</Text>
        <Text style={[styles.meta, { color: secondaryColor }]}>
          {date} • {order.store}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.total, { color: primaryColor }]}>${order.total.toFixed(2)}</Text>
        <Text style={[styles.status, { color: secondaryColor }]}>{order.status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  id: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  total: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 14, marginTop: 4 },
});
