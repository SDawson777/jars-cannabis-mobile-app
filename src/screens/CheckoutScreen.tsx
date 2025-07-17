// src/screens/CheckoutScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium, hapticHeavy } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CheckoutNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Checkout'
>;

const steps = ['Delivery', 'Contact', 'Payment', 'Review'];

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutNavProp>();
  const {
    colorTemp,
    jarsPrimary,
    jarsSecondary,
    jarsBackground,
  } = useContext(ThemeContext);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payment, setPayment] = useState<'online' | 'atPickup'>('atPickup');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // animate on any state change
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [step, method, address, fullName, phone, email, payment, termsAccepted]);

  // dynamic background
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  // glow for the next/place-order button
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
    navigation.goBack();
  };

  const handleHelp = () => {
    hapticLight();
    navigation.navigate('HelpFAQ');
  };

  const onNext = () => {
    if (step === 0 && method === 'delivery' && !address.trim()) {
      hapticHeavy();
      return Alert.alert('Error', 'Please enter delivery address.');
    }
    if (
      step === 1 &&
      (!fullName.trim() || !phone.trim() || !email.trim())
    ) {
      hapticHeavy();
      return Alert.alert('Error', 'Please fill in all contact fields.');
    }
    if (step === 3 && !termsAccepted) {
      hapticHeavy();
      return Alert.alert('Error', 'Please accept Terms & Conditions.');
    }

    if (step < steps.length - 1) {
      hapticMedium();
      setStep(step + 1);
    } else {
      hapticMedium();
      navigation.navigate('OrderConfirmation');
    }
  };

  const nextDisabled =
    (step === 0 && method === 'delivery' && !address.trim()) ||
    (step === 1 &&
      (!fullName.trim() || !phone.trim() || !email.trim())) ||
    (step === 3 && !termsAccepted);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          {steps[step]}
        </Text>
        <Pressable onPress={handleHelp}>
          <HelpCircle color={jarsPrimary} size={24} />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {steps.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressSegment,
              idx <= step && { backgroundColor: jarsPrimary },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Step 0: Delivery or Pickup */}
        {step === 0 && (
          <View style={styles.step}>
            <Text style={[styles.prompt, { color: jarsPrimary }]}>
              How would you like to receive your order?
            </Text>
            <View style={styles.optionRow}>
              {(['pickup', 'delivery'] as const).map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionCard,
                    method === opt && {
                      borderColor: jarsPrimary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setMethod(opt);
                  }}
                >
                  <Text style={[styles.optionText, { color: jarsPrimary }]}>
                    {opt === 'pickup' ? 'Pickup' : 'Delivery'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {method === 'delivery' && (
              <TextInput
                style={[
                  styles.input,
                  { borderColor: jarsSecondary, color: jarsPrimary },
                ]}
                placeholder="Enter delivery address"
                placeholderTextColor={jarsSecondary}
                value={address}
                onChangeText={(t) => {
                  hapticLight();
                  setAddress(t);
                }}
              />
            )}
          </View>
        )}

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <View style={styles.step}>
            <Text style={[styles.prompt, { color: jarsPrimary }]}>
              Who is picking up this order?
            </Text>

            <TextInput
              style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
              placeholder="Full Name"
              placeholderTextColor={jarsSecondary}
              value={fullName}
              onChangeText={(t) => {
                hapticLight();
                setFullName(t);
              }}
            />

            <TextInput
              style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
              placeholder="Phone Number"
              placeholderTextColor={jarsSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => {
                hapticLight();
                setPhone(t);
              }}
            />

            <TextInput
              style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
              placeholder="Email Address"
              placeholderTextColor={jarsSecondary}
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                hapticLight();
                setEmail(t);
              }}
            />

            <Text style={[styles.note, { color: jarsSecondary }]}>
              Must match your government-issued ID at pickup.
            </Text>
          </View>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <View style={styles.step}>
            <Text style={[styles.prompt, { color: jarsPrimary }]}>
              How would you like to pay?
            </Text>
            <View style={styles.optionColumn}>
              {(['online', 'atPickup'] as const).map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionCard,
                    payment === opt && {
                      borderColor: jarsPrimary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setPayment(opt);
                  }}
                >
                  <Text style={[styles.optionText, { color: jarsPrimary }]}>
                    {opt === 'online' ? 'Pay Online' : 'Pay at Pickup/Delivery'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Review & Terms */}
        {step === 3 && (
          <View style={styles.step}>
            <Text style={[styles.prompt, { color: jarsPrimary }]}>
              Review Your Order
            </Text>

            <View style={styles.reviewCard}>
              <Text style={[styles.reviewLabel, { color: jarsPrimary }]}>
                Method:
              </Text>
              <Text style={[styles.reviewValue, { color: jarsSecondary }]}>
                {method === 'pickup' ? 'Pickup' : address}
              </Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={[styles.reviewLabel, { color: jarsPrimary }]}>
                Contact:
              </Text>
              <Text style={[styles.reviewValue, { color: jarsSecondary }]}>
                {fullName}, {phone}, {email}
              </Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={[styles.reviewLabel, { color: jarsPrimary }]}>
                Payment:
              </Text>
              <Text style={[styles.reviewValue, { color: jarsSecondary }]}>
                {payment === 'online' ? 'Online' : 'At Pickup/Delivery'}
              </Text>
            </View>

            <Pressable
              style={styles.termsRow}
              onPress={() => {
                hapticLight();
                setTermsAccepted(!termsAccepted);
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && {
                    backgroundColor: jarsPrimary,
                    borderColor: jarsPrimary,
                  },
                ]}
              />
              <Text style={[styles.termsText, { color: jarsSecondary }]}>
                I agree to Jars’{' '}
                <Text style={[styles.link, { color: jarsPrimary }]}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text style={[styles.link, { color: jarsPrimary }]}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Next / Place Order */}
      <Pressable
        style={[
          styles.nextBtn,
          { backgroundColor: jarsPrimary },
          glowStyle,
          nextDisabled && styles.nextBtnDisabled,
        ]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text style={styles.nextBtnText}>
          {step < steps.length - 1 ? 'Continue' : 'Place Order'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  scroll: { padding: 16, paddingBottom: 120 },
  step: { marginBottom: 24 },
  prompt: { fontSize: 16, fontWeight: '500' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  optionColumn: { flexDirection: 'column' },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 8,
  },
  optionText: { fontSize: 16, fontWeight: '600' },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  note: { fontSize: 12, marginTop: 8 },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewLabel: { fontSize: 14, fontWeight: '500' },
  reviewValue: { fontSize: 14, marginTop: 4 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 8,
  },
  termsText: { flex: 1, fontSize: 14 },
  link: { textDecorationLine: 'underline' },
  nextBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
