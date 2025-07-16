// src/screens/CheckoutScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
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

// Strongly-typed navigation prop for this screen
type CheckoutNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Checkout'
>;

const steps = ['Delivery', 'Contact', 'Payment', 'Review'];

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payment, setPayment] = useState<'online' | 'atPickup'>('atPickup');
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  const handleHelp = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('HelpFAQ');
  };

  const onNext = () => {
    if (step === 0 && method === 'delivery' && !address.trim()) {
      hapticHeavy();
      return Alert.alert('Please enter delivery address');
    }
    if (step === 1 && (!fullName || !phone || !email)) {
      hapticHeavy();
      return Alert.alert('Please fill in all contact fields');
    }
    if (step === 3 && !termsAccepted) {
      hapticHeavy();
      return Alert.alert('Please accept the Terms & Conditions');
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step < steps.length - 1) {
      hapticMedium();
      setStep(step + 1);
    } else {
      hapticHeavy();
      navigation.navigate('OrderConfirmation');
    }
  };

  const nextDisabled =
    (step === 0 && method === 'delivery' && !address.trim()) ||
    (step === 1 && (!fullName || !phone || !email)) ||
    (step === 3 && !termsAccepted);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
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
        {steps.map((label, idx) => (
          <View
            key={label}
            style={[
              styles.progressSegment,
              idx <= step && { backgroundColor: jarsPrimary },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 0 && (
          <View style={styles.step}>
            <Text style={styles.prompt}>
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
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setMethod(opt);
                  }}
                >
                  <Text style={styles.optionText}>
                    {opt === 'pickup' ? 'Pickup' : 'Delivery'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {method === 'delivery' && (
              <TextInput
                style={styles.input}
                placeholder="Enter delivery address"
                value={address}
                onChangeText={(text) => {
                  hapticLight();
                  setAddress(text);
                }}
              />
            )}
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.prompt}>Who is picking up this order?</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={(t) => {
                hapticLight();
                setFullName(t);
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => {
                hapticLight();
                setPhone(t);
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                hapticLight();
                setEmail(t);
              }}
            />
            <Text style={styles.note}>
              Must match your government-issued ID at pickup.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.prompt}>How would you like to pay?</Text>
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
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setPayment(opt);
                  }}
                >
                  <Text style={styles.optionText}>
                    {opt === 'online' ? 'Pay Online' : 'Pay at Pickup/Delivery'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={styles.prompt}>Review Your Order</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Method:</Text>
              <Text style={styles.reviewValue}>
                {method === 'pickup' ? 'Pickup' : address}
              </Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Contact:</Text>
              <Text style={styles.reviewValue}>
                {fullName}, {phone}, {email}
              </Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Payment:</Text>
              <Text style={styles.reviewValue}>
                {payment === 'online' ? 'Online' : 'At Pickup/Delivery'}
              </Text>
            </View>
            <Pressable
              style={styles.termsRow}
              onPress={() => {
                hapticLight();
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
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
              <Text style={styles.termsText}>
                I agree to Jars’{' '}
                <Text style={styles.link}>Terms & Conditions</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>.
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <Pressable
        style={[
          styles.nextBtn,
          { backgroundColor: jarsPrimary },
          nextDisabled && styles.nextBtnDisabled,
        ]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text style={styles.nextBtnText}>
          {step < steps.length - 1 ? 'Continue' : 'Place Order'}
        </Text>
      </Pressable>
    </View>
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
  scroll: { padding: 16, paddingBottom: 100 },
  step: { marginBottom: 24 },
  prompt: { fontSize: 16, fontWeight: '500', color: '#333333', marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  optionColumn: { flexDirection: 'column' },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333333' },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  note: {
    fontSize: 12,
    color: '#777777',
    marginTop: 8,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewLabel: { fontSize: 14, fontWeight: '500', color: '#333333' },
  reviewValue: { fontSize: 14, color: '#333333', marginTop: 4 },
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
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  link: { color: '#2E5D46', textDecorationLine: 'underline' },
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
