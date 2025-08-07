import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export default function SplashScreenWrapper() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      HapticFeedback.trigger('impactHeavy');
      SecureStore.setItemAsync('onboardingComplete', 'true');
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/jars_logo_animation.json')}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          HapticFeedback.trigger('impactHeavy');
          SecureStore.setItemAsync('onboardingComplete', 'true');
          navigation.replace('Onboarding');
        }}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 200, height: 200 },
});
