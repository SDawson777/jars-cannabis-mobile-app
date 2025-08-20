import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import type { Order } from '../../types/order';

interface Props {
  order: Order | null;
  onClose(): void;
}

export default function OrderDetailModal({ order, onClose }: Props) {
  if (!order) return null;
  return (
    <Modal
      visible={!!order}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.close}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close order details"
        >
          <X size={24} />
        </Pressable>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Order #{order.id}</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text>
                {item.name} ×{item.quantity}
              </Text>
              <Text>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.breakdown}>
            <View style={styles.itemRow}>
              <Text>Subtotal</Text>
              <Text>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text>Taxes</Text>
              <Text>${order.taxes.toFixed(2)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text>Fees</Text>
              <Text>${order.fees.toFixed(2)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalLabel}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  close: { alignSelf: 'flex-end', padding: 16 },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  breakdown: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },
  totalLabel: { fontWeight: '600' },
});
