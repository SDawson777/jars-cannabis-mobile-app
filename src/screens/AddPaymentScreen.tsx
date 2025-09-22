import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import React, { useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import * as yup from 'yup';

import { addPaymentMethod } from '../clients/paymentClient';
import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { toast } from '../utils/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddPaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'AddPayment'>;
type FormData = {
  holderName: string;
  cardBrand: string;
  cardLast4: string;
  expiry: string;
  isDefault?: boolean;
};

type FieldDescriptor = {
  name: keyof FormData;
  label: string;
  keyboard: any;
  secure: boolean;
  hint: string;
};

const schema = yup.object({
  holderName: yup.string().required('Name is required'),
  cardBrand: yup.string().required('Card brand is required'),
  cardLast4: yup.string().required('Last 4 required').length(4, 'Must be 4 digits'),
  expiry: yup.string().required('Expiry is required'),
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
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: { holderName: '', cardBrand: '', cardLast4: '', expiry: '', isDefault: false },
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
      // send tokenized metadata to server
      await addPaymentMethod({
        cardBrand: data.cardBrand,
        cardLast4: data.cardLast4,
        holderName: data.holderName,
        expiry: data.expiry,
        isDefault: !!data.isDefault,
      });
      toast('Payment method added');
      navigation.goBack();
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    } catch {
      toast('Unable to save payment method. Please try again.');
    }
  };

  const fields: FieldDescriptor[] = [
    {
      name: 'holderName',
      label: 'Name on Card',
      keyboard: 'default',
      secure: false,
      hint: 'Name on card',
    },
    {
      name: 'cardBrand',
      label: 'Card Brand',
      keyboard: 'default',
      secure: false,
      hint: 'e.g. Visa',
    },
    {
      name: 'cardLast4',
      label: 'Last 4 digits',
      keyboard: 'numeric',
      secure: false,
      hint: 'Last 4 digits',
    },
    { name: 'expiry', label: 'Expiry (MM/YY)', keyboard: 'default', secure: false, hint: 'MM/YY' },
    {
      name: 'isDefault',
      label: 'Make default',
      keyboard: 'default',
      secure: false,
      hint: 'Set as default',
    },
  ];

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
            {f.name === 'isDefault' ? (
              <Controller
                control={control}
                name={f.name}
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    style={[
                      styles.input,
                      {
                        borderColor: jarsSecondary,
                        justifyContent: 'center',
                        flexDirection: 'row',
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={f.label}
                  >
                    <Text style={{ color: jarsPrimary }}>{value ? 'Yes (Default)' : 'No'}</Text>
                  </Pressable>
                )}
              />
            ) : (
              <Controller
                control={control}
                name={f.name as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
                    placeholder={f.label}
                    placeholderTextColor={jarsSecondary}
                    keyboardType={f.keyboard as any}
                    secureTextEntry={f.secure}
                    onBlur={onBlur}
                    value={value as string}
                    onChangeText={t => {
                      hapticLight();
                      onChange(t);
                    }}
                    accessibilityLabel={f.label}
                    accessibilityHint={f.hint}
                  />
                )}
              />
            )}
            {errors[f.name as keyof FormData] && (
              <Text style={styles.error} accessibilityRole="alert">
                {errors[f.name as keyof FormData]?.message}
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
