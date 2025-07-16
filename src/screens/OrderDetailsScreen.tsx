// src/screens/OrderDetailsScreen.tsx
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const order = (params as any).order || {
    id: '12345',
    date: '2025-07-14',
    status: 'Processing',
    items: [
      { id: '1', name: 'Rainbow Rozay', qty: 1, price: 79.0 },
      { id: '2', name: 'Moonwalker OG', qty: 2, price: 65.0 },
    ],
  };
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleReorder = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: reorder logic
    navigation.navigate('CartScreen', { items: order.items });
  };

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxes = subtotal * 0.07;
  const total = subtotal + taxes;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Order #{order.id}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.meta}>Date: {order.date}</Text>
        <Text style={styles.meta}>Status: {order.status}</Text>

        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.qty}× {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.qty).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Taxes</Text>
            <Text>${taxes.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.reorderBtn, { backgroundColor: jarsPrimary }]}
          onPress={handleReorder}
        >
          <Text style={styles.reorderText}>Reorder</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  meta: { fontSize: 14, color: '#555', marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: '600' },
  summary: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  reorderBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reorderText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
