// src/screens/CartScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import {
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticError,
} from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CartNavProp = NativeStackNavigationProp<RootStackParamList, 'CartScreen'>;

const { width } = Dimensions.get('window');
const IMAGE_SIZE = 80;

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

export default function CartScreen() {
  const navigation = useNavigation<CartNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [cart, setCart] = useState(initialCart);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [cart, promoApplied]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? 10 : 0;
  const taxes = (subtotal - discount) * 0.07;
  const total = subtotal - discount + taxes;

  const updateQty = (id: string, delta: number) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    hapticHeavy();
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCart((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'JARS10') {
      hapticSuccess();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPromoApplied(true);
      Alert.alert('Success', 'Promo code applied!');
    } else {
      hapticError();
      Alert.alert('Invalid Code', 'Please try again.');
    }
  };

  const goToHelp = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('HelpFAQ');
  };

  return (
    <View style={[styles.container, { backgroundColor: jarsBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: jarsPrimary }]}>Your Cart</Text>
        <Pressable onPress={goToHelp}>
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
              <Text style={[styles.price, { color: jarsPrimary }]}>
                ${item.price.toFixed(2)}
              </Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Pressable onPress={() => removeItem(item.id)} style={styles.remove}>
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
          placeholderTextColor="#999"
          value={promo}
          onChangeText={setPromo}
        />
        <Pressable style={[styles.promoBtn, { backgroundColor: jarsPrimary }]} onPress={applyPromo}>
          <Text style={styles.promoBtnText}>Apply</Text>
        </Pressable>
      </View>

      {/* Order Summary */}
      <View style={styles.summary}>
        <Text style={[styles.summaryTitle, { color: jarsPrimary }]}>Order Summary</Text>
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
          <Text style={[styles.totalValue, { color: jarsPrimary }]}>
            ${total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Proceed Button */}
      <Pressable
        style={[styles.checkoutBtn, { backgroundColor: jarsPrimary }]}
        onPress={() => {
          hapticMedium();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          navigation.navigate('Checkout');
        }}
      >
        <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
      </Pressable>
    </View>
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
  title: { fontSize: 20, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: IMAGE_SIZE + 20,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20 },
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
