// src/screens/SplashScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);
  const fade = new Animated.Value(0);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticLight();
    Animated.timing(fade, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 1000);
    });
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : '#F9F9F9';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={[styles.logo, { color: jarsPrimary }]}>JARS</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '900' },
});
