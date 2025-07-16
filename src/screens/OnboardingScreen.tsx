// src/screens/OnboardingScreen.tsx
import React, { useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Strongly-typed navigation prop
type OnboardingNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleNext = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Advance through onboarding pages or finish
    // Here we jump straight to age verification
    navigation.replace('AgeVerification');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: jarsPrimary }]}>
          Welcome to JARS
        </Text>
        <Text style={styles.subtitle}>
          Discover the best cannabis products curated just for you.
        </Text>
      </View>
      <Pressable style={[styles.nextBtn, { backgroundColor: jarsPrimary }]} onPress={handleNext}>
        <Text style={styles.nextText}>Get Started</Text>
        <ChevronRight color="#FFF" size={24} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 22 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextText: { color: '#FFF', fontSize: 18, fontWeight: '600', marginRight: 8 },
});
