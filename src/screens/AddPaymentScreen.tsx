// src/screens/AddPaymentScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddPaymentScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);

  // Dynamic background based on theme color temperature
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' :
    colorTemp === 'cool' ? '#F7F9FA' :
                          '#F9F9F9';

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSave = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    // TODO: integrate real payment-save logic
    Alert.alert('Payment Added', 'Your new payment method has been saved.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color="#333333" size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Add Payment
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Name on Card</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Expiry (MM/YY)</Text>
        <TextInput
          style={styles.input}
          value={expiry}
          onChangeText={setExpiry}
          placeholder="MM/YY"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>CVV</Text>
        <TextInput
          style={styles.input}
          value={cvv}
          onChangeText={setCvv}
          placeholder="123"
          secureTextEntry
          keyboardType="numeric"
          placeholderTextColor="#999999"
        />

        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>Save Payment</Text>
        </Pressable>
      </View>
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
  iconBtn: { width: 24, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  form: { padding: 16 },
  label: {
    fontSize: 14,
    color: '#777777',
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  saveBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
