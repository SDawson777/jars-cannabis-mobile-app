// src/screens/IDVerificationScreen.tsx
// First-time order ID verification screen

import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Shield, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useForm, Controller, type ControllerRenderProps } from 'react-hook-form';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  UIManager,
  Platform,
  ActivityIndicator,
  Animated,
  Switch,
} from 'react-native';
import * as yup from 'yup';

import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium, hapticHeavy } from '../utils/haptic';
import { toast } from '../utils/toast';
import { useTranslation } from '../i18n/useTranslation';
import verificationService, {
  DocumentType,
  SubmitVerificationRequest,
} from '../services/verificationService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IDVerificationNavProp = NativeStackNavigationProp<RootStackParamList, 'IDVerification'>;
type IDVerificationRouteProp = RouteProp<RootStackParamList, 'IDVerification'>;

interface IDVerificationFormData {
  dateOfBirth: string;
  state: string;
  documentType: DocumentType;
  consentGiven: boolean;
}

const schema = yup.object({
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD')
    .test('valid-date', 'Invalid date', value => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('is-21', 'You must be at least 21 years old', value => {
      if (!value) return false;
      return verificationService.isOver21(value);
    }),
  state: yup
    .string()
    .required('State is required')
    .length(2, 'Use 2-letter state code')
    .test('valid-state', 'Invalid state code', value => {
      if (!value) return false;
      return verificationService.isValidStateCode(value);
    }),
  documentType: yup
    .string()
    .oneOf(['drivers_license', 'passport', 'state_id'] as const)
    .required('Document type is required'),
  consentGiven: yup.boolean().oneOf([true], 'You must consent to age verification').required(),
});

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'state_id', label: 'State ID' },
];

type IDVerificationField<TFieldName extends keyof IDVerificationFormData> = ControllerRenderProps<
  IDVerificationFormData,
  TFieldName
>;

export default function IDVerificationScreen() {
  const navigation = useNavigation<IDVerificationNavProp>();
  const route = useRoute<IDVerificationRouteProp>();
  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const form = useForm<IDVerificationFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      dateOfBirth: '',
      state: '',
      documentType: 'drivers_license',
      consentGiven: false,
    },
  });

  const { control, handleSubmit, watch, formState } = form;
  const { errors, isValid } = formState;
  watch('consentGiven');

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const glowStyle =
    colorTemp === 'warm'
      ? {
          shadowColor: brandPrimary,
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

  const onSubmit = async (data: IDVerificationFormData) => {
    hapticMedium();
    setIsSubmitting(true);
    setVerificationError(null);

    try {
      // Create a verification session
      const session = await verificationService.createVerificationSession({
        documentType: data.documentType,
      });

      // Submit verification data
      const submitData: SubmitVerificationRequest = {
        dateOfBirth: data.dateOfBirth,
        state: data.state.toUpperCase(),
        documentType: data.documentType,
        consentGiven: data.consentGiven,
      };

      const result = await verificationService.submitVerification(session.id, submitData);

      if (result.success || result.status === 'approved') {
        setVerificationSuccess(true);
        hapticMedium();
        toast(t('verification.success') || 'Verification successful!');

        // Navigate back to checkout after a brief delay
        setTimeout(() => {
          const returnTo = (route.params as any)?.returnTo;
          if (returnTo === 'Checkout') {
            navigation.navigate('Checkout');
          } else {
            navigation.goBack();
          }
        }, 1500);
      } else {
        hapticHeavy();
        setVerificationError(result.error || 'Verification failed. Please try again.');
      }
    } catch (error: unknown) {
      hapticHeavy();
      const err = error as { message?: string };
      setVerificationError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successIcon,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <CheckCircle2 size={80} color="#22C55E" />
          </Animated.View>
          <Text style={[styles.successTitle, { color: brandPrimary }]}>
            {t('verification.verified') || 'Identity Verified!'}
          </Text>
          <Text style={[styles.successSubtitle, { color: brandSecondary }]}>
            {t('verification.canProceed') || 'You can now proceed with your order.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      testID="id-verification-screen"
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} accessibilityLabel="Go back">
          <ChevronLeft size={24} color={brandPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: brandPrimary }]}>
          {t('verification.title') || 'Age Verification'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: `${brandPrimary}10` }]}>
            <Shield size={24} color={brandPrimary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: brandPrimary }]}>
                {t('verification.infoTitle') || 'First Order Verification'}
              </Text>
              <Text style={[styles.infoText, { color: brandSecondary }]}>
                {t('verification.infoText') ||
                  'To comply with state regulations, we need to verify your age before your first purchase. This only needs to be done once.'}
              </Text>
            </View>
          </View>

          {/* Error Display */}
          {verificationError && (
            <View style={[styles.errorCard, { backgroundColor: '#FEE2E2' }]}>
              <AlertCircle size={20} color="#DC2626" />
              <Text style={styles.errorText}>{verificationError}</Text>
            </View>
          )}

          {/* Document Type Selection */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: brandPrimary }]}>
              {t('verification.documentType') || 'Document Type'}
            </Text>
            <Controller
              control={control}
              name="documentType"
              render={({ field }: { field: IDVerificationField<'documentType'> }) => {
                const { onChange, value } = field;
                return (
                  <View style={styles.documentTypeContainer}>
                    {documentTypes.map(docType => (
                      <Pressable
                        key={docType.value}
                        style={[
                          styles.documentTypeOption,
                          {
                            borderColor: value === docType.value ? brandPrimary : '#E5E7EB',
                            backgroundColor: value === docType.value ? `${brandPrimary}10` : '#FFF',
                          },
                        ]}
                        onPress={() => {
                          hapticLight();
                          onChange(docType.value);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: value === docType.value }}
                      >
                        <Text
                          style={[
                            styles.documentTypeText,
                            { color: value === docType.value ? brandPrimary : brandSecondary },
                          ]}
                        >
                          {docType.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                );
              }}
            />
            {errors.documentType && (
              <Text style={styles.fieldError}>{errors.documentType.message}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: brandPrimary }]}>
              {t('verification.dateOfBirth') || 'Date of Birth'}
            </Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }: { field: IDVerificationField<'dateOfBirth'> }) => {
                const { onChange, onBlur, value } = field;
                return (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: errors.dateOfBirth ? '#DC2626' : '#E5E7EB',
                        color: brandPrimary,
                      },
                    ]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    autoCapitalize="none"
                    testID="dob-input"
                  />
                );
              }}
            />
            {errors.dateOfBirth && (
              <Text style={styles.fieldError}>{errors.dateOfBirth.message}</Text>
            )}
            <Text style={[styles.hint, { color: brandSecondary }]}>
              {t('verification.dobHint') || 'Must be 21 or older'}
            </Text>
          </View>

          {/* State */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: brandPrimary }]}>
              {t('verification.state') || 'State'}
            </Text>
            <Controller
              control={control}
              name="state"
              render={({ field }: { field: IDVerificationField<'state'> }) => {
                const { onChange, onBlur, value } = field;
                return (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: errors.state ? '#DC2626' : '#E5E7EB',
                        color: brandPrimary,
                      },
                    ]}
                    placeholder="CA"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={text => onChange(text.toUpperCase())}
                    onBlur={onBlur}
                    keyboardType="default"
                    maxLength={2}
                    autoCapitalize="characters"
                    testID="state-input"
                  />
                );
              }}
            />
            {errors.state && <Text style={styles.fieldError}>{errors.state.message}</Text>}
            <Text style={[styles.hint, { color: brandSecondary }]}>
              {t('verification.stateHint') || '2-letter state code (e.g., CA, NY)'}
            </Text>
          </View>

          {/* Consent Checkbox */}
          <View style={styles.consentContainer}>
            <Controller
              control={control}
              name="consentGiven"
              render={({ field }: { field: IDVerificationField<'consentGiven'> }) => {
                const { onChange, value } = field;
                return (
                  <Pressable
                    style={styles.consentRow}
                    onPress={() => {
                      hapticLight();
                      onChange(!value);
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: value }}
                  >
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#E5E7EB', true: brandPrimary }}
                      thumbColor={value ? '#FFF' : '#FFF'}
                      testID="consent-switch"
                    />
                    <Text style={[styles.consentText, { color: brandSecondary }]}>
                      {t('verification.consentText') ||
                        'I consent to the verification of my age and identity for compliance purposes. I confirm the information provided is accurate.'}
                    </Text>
                  </Pressable>
                );
              }}
            />
            {errors.consentGiven && (
              <Text style={styles.fieldError}>{errors.consentGiven.message}</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: isValid && !isSubmitting ? brandPrimary : '#D1D5DB' },
            isValid && !isSubmitting ? glowStyle : {},
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Verify age"
          testID="verify-button"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('verification.verifyButton') || 'Verify My Age'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#DC2626',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentTypeOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
  },
  documentTypeText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  consentContainer: {
    marginTop: 8,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
