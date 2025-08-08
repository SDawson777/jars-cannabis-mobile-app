// src/screens/EditAddressScreen.tsx
import React, { useEffect, useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addressSchema, AddressFormValues } from './account/addressSchema';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  // Existing address passed via params
  const addr = (route.params as any)?.address || {};
  const {
    control,
    handleSubmit,
  } = useForm<AddressFormValues>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      label: addr.label,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSave = async (values: AddressFormValues) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      setLoading(true);
      await phase4Client.put(`/addresses/${addr.id}`, values);
      toast('Address saved');
      navigation.goBack();
    } catch (e: any) {
      toast(e.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Edit Address</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {[
          { name: 'label', placeholder: 'Label' },
          { name: 'line1', placeholder: 'Street Address' },
          { name: 'city', placeholder: 'City' },
          { name: 'state', placeholder: 'State' },
          { name: 'zip', placeholder: 'ZIP Code', keyboard: 'numeric' },
        ].map(({ name, placeholder, keyboard }) => (
          <View key={name}>
            <Text style={[styles.label, { color: jarsPrimary }]}>{placeholder}</Text>
            <Controller
              control={control}
              name={name as keyof AddressFormValues}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    style={[styles.input, { borderColor: jarsSecondary }]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={t => {
                      hapticLight();
                      onChange(t);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={jarsSecondary}
                    keyboardType={keyboard as any}
                    accessibilityLabel={placeholder}
                    accessibilityHint={`Enter ${placeholder.toLowerCase()}`}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />
          </View>
        ))}

        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }]}
          onPress={handleSubmit(onSave)}
          accessibilityLabel="Save address"
          accessibilityHint="Saves this address"
        >
          {loading ? (
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
  label: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  error: {
    color: 'red',
    marginTop: 4,
  },
});
