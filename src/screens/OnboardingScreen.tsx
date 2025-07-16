// src/screens/OnboardingScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const slides = [
  {
    id: '1',
    title: 'Welcome to Jars',
    text: 'Discover premium cannabis deliveries near you.',
    image: require('../assets/onboard1.png'),
  },
  {
    id: '2',
    title: 'Shop Your Way',
    text: 'Browse top brands, find deals, and earn rewards.',
    image: require('../assets/onboard2.png'),
  },
  {
    id: '3',
    title: 'Get Inspired',
    text: 'Explore educational content & community tips.',
    image: require('../assets/onboard3.png'),
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [index]);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : '#F9F9F9';

  const handleNext = () => {
    hapticLight();
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.replace('AgeVerification');
    }
  };

  const handleSkip = () => {
    hapticLight();
    navigation.replace('AgeVerification');
  };

  const slide = slides[index];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.slide}>
        <Image source={slide.image} style={styles.image} />
        <Text style={[styles.title, { color: jarsPrimary }]}>
          {slide.title}
        </Text>
        <Text style={styles.text}>{slide.text}</Text>
      </View>
      <View style={styles.footer}>
        <Pressable onPress={handleSkip}>
          <Text style={[styles.skip, { color: jarsPrimary }]}>Skip</Text>
        </Pressable>
        <Pressable
          style={[styles.nextBtn, { backgroundColor: jarsPrimary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {index < slides.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: { width: 200, height: 200, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  text: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  skip: { fontSize: 16, fontWeight: '500' },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
