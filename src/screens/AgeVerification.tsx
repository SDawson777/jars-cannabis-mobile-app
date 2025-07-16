import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AgeVerification() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [date, setDate] = useState<Date>();
  const [showPicker, setShowPicker] = useState(false);

  // Animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleDatePress = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPicker(true);
  };

  const handleDateChange = (_: any, selected?: Date) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPicker(Platform.OS === 'ios');
    if (selected) setDate(selected);
  };

  const handleEnter = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!date) {
      Alert.alert('Error', 'Please select your birth date.');
      return;
    }
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const mDiff = today.getMonth() - date.getMonth();
    const dDiff = today.getDate() - date.getDate();
    const is21 =
      age > 21 ||
      (age === 21 && (mDiff > 0 || (mDiff === 0 && dDiff >= 0)));
    if (is21) {
      navigation.replace('StoreSelection');
    } else {
      Alert.alert(
        'Access Denied',
        'You must be at least 21 years old to use this app.'
      );
    }
  };

  // dynamic bg
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: jarsPrimary }]}>
        Verify Your Age
      </Text>
      <Text style={styles.subtitle}>
        You must be 21+ to enter. Please select your date of birth below.
      </Text>

      <Pressable style={styles.dateButton} onPress={handleDatePress}>
        <Text style={styles.dateButtonText}>
          {date ? date.toDateString() : 'Select Date of Birth'}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Pressable
        style={[styles.enterButton, { backgroundColor: jarsPrimary }]}
        onPress={handleEnter}
      >
        <Text style={styles.enterButtonText}>Enter</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        By entering, you confirm that you are of legal age to purchase cannabis
        and agree to our Terms & Conditions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  enterButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 30,
  },
});
