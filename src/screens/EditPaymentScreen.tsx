import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

import { updatePaymentMethod } from '../clients/paymentClient';
import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { toast } from '../utils/toast';



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EditPaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'EditPayment'>;
type EditPaymentRouteProp = RouteProp<RootStackParamList, 'EditPayment'>;
type FormData = { cardNumber: string; name: string; expiry: string; cvv: string };

const schema = yup.object({
  cardNumber: yup.string().required('Card number is required'),
  name: yup.string().required('Name is required'),
  expiry: yup.string().required('Expiry is required'),
  cvv: yup.string().required('CVV is required'),
});

export default function EditPaymentScreen() {
  const navigation = useNavigation<EditPaymentNavProp>();
  const route = useRoute<EditPaymentRouteProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const pm = route.params?.payment || {};

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: pm.cardNumber || '',
      name: pm.name || '',
      expiry: pm.expiry || '',
      cvv: pm.cvv || '',
    },
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
      await updatePaymentMethod(pm.id, data);
      toast('Payment method updated');
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
      hint: 'Edit your card number',
    },
    {
      name: 'name',
      label: 'Name on Card',
      keyboard: 'default',
      secure: false,
      hint: 'Edit the name on the card',
    },
    {
      name: 'expiry',
      label: 'Expiry (MM/YY)',
      keyboard: 'default',
      secure: false,
      hint: 'Edit expiration date in MM/YY format',
    },
    {
      name: 'cvv',
      label: 'CVV',
      keyboard: 'numeric',
      secure: true,
      hint: 'Edit the security code',
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
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Edit Payment</Text>
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
          accessibilityLabel="Save changes"
          accessibilityHint="Saves your updated payment method"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
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
  error: { color: 'red', marginTop: 4 },
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
