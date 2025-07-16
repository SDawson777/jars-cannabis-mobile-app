// src/screens/EditPaymentScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  // Assume payment details passed in params
  const pm = (route.params as any)?.payment || {};
  const [cardNumber, setCardNumber] = useState(pm.cardNumber || '');
  const [name, setName] = useState(pm.name || '');
  const [expiry, setExpiry] = useState(pm.expiry || '');
  const [cvv, setCvv] = useState(pm.cvv || '');

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

  const onSave = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    // TODO: save updated payment
    Alert.alert('Payment Updated', 'Your payment method has been updated.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Edit Payment
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(t) => {
            hapticLight();
            setCardNumber(t);
          }}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Name on Card</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => {
            hapticLight();
            setName(t);
          }}
          placeholder="John Doe"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Expiry (MM/YY)</Text>
        <TextInput
          style={styles.input}
          value={expiry}
          onChangeText={(t) => {
            hapticLight();
            setExpiry(t);
          }}
          placeholder="MM/YY"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>CVV</Text>
        <TextInput
          style={styles.input}
          value={cvv}
          onChangeText={(t) => {
            hapticLight();
            setCvv(t);
          }}
          placeholder="123"
          secureTextEntry
          keyboardType="numeric"
          placeholderTextColor="#999999"
        />

        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>Save Changes</Text>
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
