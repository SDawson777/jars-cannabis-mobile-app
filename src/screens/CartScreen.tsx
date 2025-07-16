// src/screens/CartScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, Trash2, HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import {
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticError,
} from '../utils/haptic';

const { width } = Dimensions.get('window');

const initialCart = [
  {
    id: '1',
    name: 'Rainbow Rozay',
    price: 79.0,
    image: require('../assets/product1.png'),
    quantity: 1,
  },
  {
    id: '2',
    name: 'Moonwalker OG',
    price: 65.0,
    image: require('../assets/product2.png'),
    quantity: 2,
  },
];

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CartScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [cart, setCart] = useState(initialCart);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Pricing calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = promoApplied ? 10 : 0;
  const taxes = (subtotal - discount) * 0.07;
  const total = subtotal - discount + taxes;

  // Dynamic background
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  // Handlers
  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticLight();
    navigation.goBack();
  };

  const handleHelp = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticLight();
    navigation.navigate('HelpFAQ');
  };

  const updateQty = (id, delta) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel', onPress: () => hapticLight() },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          hapticMedium();
          setCart((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const applyPromo = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (promo.trim().toUpperCase() === 'JARS10') {
      setPromoApplied(true);
      hapticSuccess();
      Alert.alert('Success', 'Promo code applied!');
    } else {
      hapticError();
      Alert.alert('Invalid Code', 'Please try again.');
    }
  };

  const proceedToCheckout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticHeavy();
    navigation.navigate('Checkout');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: jarsPrimary }]}>
          Your Cart
        </Text>
        <Pressable onPress={handleHelp}>
          <HelpCircle color={jarsPrimary} size={24} />
        </Pressable>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.id, -1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.id, 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Pressable
                  style={styles.remove}
                  onPress={() => removeItem(item.id)}
                >
                  <Trash2 color="#6A0572" size={20} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {/* Promo Code */}
      <View style={styles.promoSection}>
        <TextInput
          style={styles.promoInput}
          placeholder="Enter Promo Code"
          value={promo}
          onChangeText={setPromo}
          placeholderTextColor="#999999"
        />
        <Pressable style={[styles.promoBtn, { backgroundColor: jarsPrimary }]} onPress={applyPromo}>
          <Text style={styles.promoBtnText}>Apply</Text>
        </Pressable>
      </View>

      {/* Order Summary */}
      <View style={styles.summary}>
        <Text style={[styles.summaryTitle, { color: jarsPrimary }]}>
          Order Summary
        </Text>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>Subtotal</Text>
          <Text style={styles.lineValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>Discounts</Text>
          <Text style={styles.lineValue}>−${discount.toFixed(2)}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>Estimated Taxes</Text>
          <Text style={styles.lineValue}>${taxes.toFixed(2)}</Text>
        </View>
        <View style={styles.lineTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Proceed Button */}
      <Pressable
        style={[styles.checkoutBtn, { backgroundColor: jarsPrimary }]}
        onPress={proceedToCheckout}
      >
        <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
      </Pressable>
    </View>
  );
}

const CARD_HEIGHT = 100;
const IMAGE_SIZE = 80;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: CARD_HEIGHT,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: '#333333' },
  price: { fontSize: 16, fontWeight: '700', color: '#2E5D46' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, color: '#333333' },
  qty: { marginHorizontal: 8, fontSize: 16, fontWeight: '500' },
  remove: { marginLeft: 'auto' },
  promoSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  promoBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  promoBtnText: { color: '#FFFFFF', fontWeight: '600' },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lineLabel: { fontSize: 14 },
  lineValue: { fontSize: 14 },
  lineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '700' },
  checkoutBtn: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
