import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { addPaymentMethod } from '../clients/paymentClient';
import { toast } from '../utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import type { RootStackParamList } from '../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddPaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'AddPayment'>;
type FormData = { cardNumber: string; name: string; expiry: string; cvv: string };

const schema = yup.object({
  cardNumber: yup.string().required('Card number is required'),
  name: yup.string().required('Name is required'),
  expiry: yup.string().required('Expiry is required'),
  cvv: yup.string().required('CVV is required'),
});

export default function AddPaymentScreen() {
  const navigation = useNavigation<AddPaymentNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

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

  const onSubmit = async (data: FormData) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await addPaymentMethod(data);
      toast('Payment method added');
      navigation.goBack();
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    } catch {
      toast('Unable to save payment method. Please try again.');
    }
  };

  const fields = [
    {
      name: 'cardNumber',
      label: 'Card Number',
      keyboard: 'numeric',
      secure: false,
      hint: 'Enter your card number',
    },
    {
      name: 'name',
      label: 'Name on Card',
      keyboard: 'default',
      secure: false,
      hint: 'Enter the name on the card',
    },
    {
      name: 'expiry',
      label: 'Expiry (MM/YY)',
      keyboard: 'default',
      secure: false,
      hint: 'Enter expiration date in MM/YY format',
    },
    {
      name: 'cvv',
      label: 'CVV',
      keyboard: 'numeric',
      secure: true,
      hint: 'Enter the security code',
    },
  ] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable
          onPress={handleBack}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to previous screen"
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Add Payment</Text>
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.form}>
        {fields.map(f => (
          <View key={f.name} style={styles.field}>
            <Text style={[styles.label, { color: jarsSecondary }]}>{f.label}</Text>
            <Controller
              control={control}
              name={f.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
                  placeholder={f.label}
                  placeholderTextColor={jarsSecondary}
                  keyboardType={f.keyboard as any}
                  secureTextEntry={f.secure}
                  onBlur={onBlur}
                  value={value}
                  onChangeText={t => {
                    hapticLight();
                    onChange(t);
                  }}
                  accessibilityLabel={f.label}
                  accessibilityHint={f.hint}
                />
              )}
            />
            {errors[f.name] && (
              <Text style={styles.error} accessibilityRole="alert">
                {errors[f.name]?.message}
              </Text>
            )}
          </View>
        ))}
        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: jarsPrimary },
            glowStyle,
            (!isValid || isSubmitting) && { opacity: 0.5 },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Save payment method"
          accessibilityHint="Saves this payment method to your account"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>Save Payment</Text>
          )}
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
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  error: { color: 'red', marginTop: 4 },
  saveBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
