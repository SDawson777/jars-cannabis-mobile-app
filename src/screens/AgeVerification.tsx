// src/screens/AgeVerification.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
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
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticHeavy, hapticMedium } from '../utils/haptic';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { AccessibilityInfo } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AgeVerificationNavProp = NativeStackNavigationProp<RootStackParamList, 'AgeVerification'>;

export default function AgeVerification() {
  const navigation = useNavigation<AgeVerificationNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const [date, setDate] = useState<Date>();
  const [showPicker, setShowPicker] = useState(false);
  const [underage, setUnderage] = useState(false);
  const tint = useSharedValue(0);

  // Animate on mount (and on state change)
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [underage]);

  // Background based on time/weather
  const bgColor =
    colorTemp === 'warm' ? '#FFF8ED' : colorTemp === 'cool' ? '#EFF5F9' : jarsBackground;

  // Glow effect for buttons
  const glowStyle =
    colorTemp === 'warm'
      ? {
          shadowColor: jarsPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
        }
      : colorTemp === 'cool'
        ? {
            shadowColor: '#00A4FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }
        : {};

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
      navigation.replace('LoginSignUpDecision');
    } else {
      hapticHeavy();
      // Enter the under-21 path
      setUnderage(true);
      tint.value = withTiming(0.8, { duration: 300 });
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) {
          Speech.speak('Access Denied. You must be 21 years or older.');
        }
      });
    }
  };

  const handleUnderageBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.replace('Onboarding');
  };

  // Under-21 view
  if (underage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: jarsPrimary }]}>Access Denied</Text>
          <Text style={[styles.subtitle, { color: jarsSecondary }]}>
            You must be at least 21 to continue.
          </Text>
        </View>
        <Pressable
          style={[styles.enterBtn, { backgroundColor: jarsPrimary }, glowStyle]}
          onPress={handleUnderageBack}
        >
          <ChevronLeft color="#FFF" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.enterText}>Back to Start</Text>
        </Pressable>
        <View style={styles.footer}>
          <Text style={[styles.disclaimer, { color: jarsSecondary }]}>Questions?</Text>
          <Pressable
            onPress={() => {
              hapticLight();
              navigation.navigate('Legal');
            }}
          >
            <Text style={[styles.link, { color: jarsPrimary }]}>See our policies</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Default age-verification view
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#6A0572', opacity: tint }]}
      />
      <Text style={[styles.title, { color: jarsPrimary }]}>Verify Your Age</Text>

      <Pressable
        style={[styles.dateButton, glowStyle]}
        onPress={() => {
          hapticLight();
          setShowPicker(true);
        }}
      >
        <Text style={[styles.dateText, { color: jarsSecondary }]}>
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
          accessibilityLabel="Date of Birth"
        />
      )}

      <Pressable
        style={[styles.enterBtn, { backgroundColor: jarsPrimary }, glowStyle]}
        onPress={handleEnter}
        accessibilityRole="button"
      >
        <Text style={styles.enterText}>Enter</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={[styles.disclaimer, { color: jarsSecondary }]}>
          By tapping Enter you confirm you are 21+ and agree to our
        </Text>
        <Pressable
          onPress={() => {
            hapticLight();
            navigation.navigate('Legal');
          }}
        >
          <Text style={[styles.link, { color: jarsPrimary }]}>Terms & Privacy</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: '#EEEEEE',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  enterText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  link: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
