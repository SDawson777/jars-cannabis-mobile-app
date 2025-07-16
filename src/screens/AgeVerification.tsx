// src/screens/AgeVerification.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticHeavy } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AgeVerificationNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AgeVerification'
>;

export default function AgeVerification() {
  const navigation = useNavigation<AgeVerificationNavProp>();
  const [date, setDate] = useState<Date>();
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: any, selected?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) setDate(selected);
  };

  const handleEnter = () => {
    if (!date) {
      return Alert.alert('Error', 'Please select your birth date.');
    }
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    const d = today.getDate() - date.getDate();
    const is21 = age > 21 || (age === 21 && (m > 0 || (m === 0 && d >= 0)));

    if (is21) {
      hapticLight();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      navigation.replace('StoreSelection');
    } else {
      hapticHeavy();
      Alert.alert('Access Denied', 'You must be at least 21 years old.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Age</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => {
          hapticLight();
          setShowPicker(true);
        }}
      >
        <Text style={styles.dateText}>
          {date ? date.toDateString() : 'Select Date of Birth'}
        </Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          mode="date"
          display="default"
          value={date || new Date(2000, 0, 1)}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      <Pressable style={styles.enterBtn} onPress={handleEnter}>
        <Text style={styles.enterText}>Enter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E5D46', marginBottom: 20 },
  dateButton: {
    backgroundColor: '#EEEEEE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: { fontSize: 16, color: '#333333' },
  enterBtn: {
    backgroundColor: '#2E5D46',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  enterText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
