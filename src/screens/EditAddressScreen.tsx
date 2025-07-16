// src/screens/EditAddressScreen.tsx
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

export default function EditAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  // Assume address passed in params
  const addr = (route.params as any)?.address || {};
  const [label, setLabel] = useState(addr.label || '');
  const [line1, setLine1] = useState(addr.line1 || '');
  const [city, setCity] = useState(addr.city || '');
  const [stateField, setStateField] = useState(addr.state || '');
  const [zip, setZip] = useState(addr.zip || '');

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
    // TODO: save updated address
    Alert.alert('Address Updated', 'Your address changes have been saved.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Edit Address
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={(t) => {
            hapticLight();
            setLabel(t);
          }}
          placeholder="Home, Work, etc."
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          value={line1}
          onChangeText={(t) => {
            hapticLight();
            setLine1(t);
          }}
          placeholder="123 Main St"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={(t) => {
            hapticLight();
            setCity(t);
          }}
          placeholder="City"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={stateField}
          onChangeText={(t) => {
            hapticLight();
            setStateField(t);
          }}
          placeholder="State"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>ZIP Code</Text>
        <TextInput
          style={styles.input}
          value={zip}
          onChangeText={(t) => {
            hapticLight();
            setZip(t);
          }}
          placeholder="ZIP"
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
