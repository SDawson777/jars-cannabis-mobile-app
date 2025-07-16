// src/screens/AddAddressScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);

  // Determine background from colorTemp
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' :
    colorTemp === 'cool' ? '#F7F9FA' :
                          '#F9F9F9';

  // Form state
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');

  // Animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSave = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    // TODO: integrate actual save logic
    Alert.alert('Address Added', 'Your new address has been saved.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color="#333333" size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Add Address
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Label (e.g. Home)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Home, Work, etc."
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          value={line1}
          onChangeText={setLine1}
          placeholder="123 Main St"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={stateField}
          onChangeText={setStateField}
          placeholder="State"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>ZIP Code</Text>
        <TextInput
          style={styles.input}
          value={zip}
          onChangeText={setZip}
          placeholder="ZIP"
          keyboardType="numeric"
          placeholderTextColor="#999999"
        />

        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>Save Address</Text>
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
