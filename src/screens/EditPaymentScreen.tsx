// src/screens/EditPaymentScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EditPaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'EditPayment'>;
type EditPaymentRouteProp = RouteProp<RootStackParamList, 'EditPayment'>;

export default function EditPaymentScreen() {
  const navigation = useNavigation<EditPaymentNavProp>();
  const route = useRoute<EditPaymentRouteProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const pm = route.params?.payment || {};
  const [cardNumber, setCardNumber] = useState(pm.cardNumber || '');
  const [name, setName] = useState(pm.name || '');
  const [expiry, setExpiry] = useState(pm.expiry || '');
  const [cvv, setCvv] = useState(pm.cvv || '');

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
    // TODO: persist updated payment
    Alert.alert('Payment Updated', 'Your payment method has been updated.');
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
    {
      label: 'Name on Card',
      value: name,
      setter: setName,
      keyboard: 'default',
      secure: false,
    },
    {
      label: 'Expiry (MM/YY)',
      value: expiry,
      setter: setExpiry,
      keyboard: 'default',
      secure: false,
    },
    {
      label: 'CVV',
      value: cvv,
      setter: setCvv,
      keyboard: 'numeric',
      secure: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Edit Payment</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.form}>
        {fields.map(({ label, value, setter, keyboard, secure }) => (
          <View key={label} style={styles.field}>
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
          <Text style={styles.saveText}>Save Changes</Text>
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
  field: { marginBottom: 12 },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
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
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
