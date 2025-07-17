// src/screens/AddAddressScreen.tsx
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
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddAddressNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddAddress'
>;

export default function AddAddressScreen() {
  const navigation = useNavigation<AddAddressNavProp>();
  const {
    colorTemp,
    jarsPrimary,
    jarsSecondary,
    jarsBackground,
  } = useContext(ThemeContext);

  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

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
    if (!label.trim() || !line1.trim() || !city.trim()) {
      hapticLight();
      return Alert.alert('Error', 'Please fill in all required fields.');
    }
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: integrate actual save logic
    Alert.alert('Address Added', 'Your new address has been saved.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Add Address
        </Text>
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.form}>
        {[
          { label: 'Label (Home, Work)', value: label, setter: setLabel },
          { label: 'Street Address', value: line1, setter: setLine1 },
          { label: 'City', value: city, setter: setCity },
          { label: 'State', value: stateField, setter: setStateField },
          { label: 'ZIP Code', value: zip, setter: setZip, keyboard: 'numeric' },
        ].map(({ label: lbl, value, setter, keyboard }) => (
          <View key={lbl}>
            <Text style={[styles.label, { color: jarsSecondary }]}>{lbl}</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: jarsSecondary, color: jarsPrimary },
              ]}
              placeholder={lbl}
              placeholderTextColor={jarsSecondary}
              keyboardType={keyboard as any}
              value={value}
              onChangeText={(t) => {
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
          <Text style={styles.saveText}>Save Address</Text>
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
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
