// src/screens/SplashScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  Animated,
  Easing,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
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
type SplashNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'SplashScreen'
>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashNavProp>();
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);
  const fade = React.useRef(new Animated.Value(0)).current;

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
  }, [fade, navigation]);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : '#F9F9F9';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.Text style={[styles.logo, { opacity: fade, color: jarsPrimary }]}>
        JARS
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '900' },
});
