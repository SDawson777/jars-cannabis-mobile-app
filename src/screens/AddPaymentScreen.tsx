// src/screens/AddPaymentScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddPaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'AddPayment'>;

export default function AddPaymentScreen() {
  const navigation = useNavigation<AddPaymentNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const glowStyle =
    colorTemp === 'warm'
      ? {
          shadowColor: jarsPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }
      : colorTemp === 'cool'
        ? {
            shadowColor: '#00A4FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }
        : {};

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSave = () => {
    if (!cardNumber.trim() || !name.trim() || !expiry.trim() || !cvv.trim()) {
      hapticLight();
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: integrate saving logic
    Alert.alert('Payment Added', 'Your new payment method has been saved.');
    navigation.goBack();
  };

  const fields = [
    {
      label: 'Card Number',
      value: cardNumber,
      setter: setCardNumber,
      keyboard: 'numeric',
      secure: false,
    },
    { label: 'Name on Card', value: name, setter: setName, keyboard: 'default', secure: false },
    {
      label: 'Expiry (MM/YY)',
      value: expiry,
      setter: setExpiry,
      keyboard: 'default',
      secure: false,
    },
    { label: 'CVV', value: cvv, setter: setCvv, keyboard: 'numeric', secure: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Add Payment</Text>
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.form}>
        {fields.map(({ label, value, setter, keyboard, secure }) => (
          <View key={label}>
            <Text style={[styles.label, { color: jarsSecondary }]}>{label}</Text>
            <TextInput
              style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
              placeholder={label}
              placeholderTextColor={jarsSecondary}
              keyboardType={keyboard as any}
              secureTextEntry={secure}
              value={value}
              onChangeText={t => {
                hapticLight();
                setter(t);
              }}
            />
          </View>
        ))}
        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }, glowStyle]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>Save Payment</Text>
        </Pressable>
      </View>
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
    borderBottomWidth: 1,
  },
  iconBtn: { width: 24, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  form: { padding: 16 },
  label: { fontSize: 14, marginTop: 16, marginBottom: 4 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  saveBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
