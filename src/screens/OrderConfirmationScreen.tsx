// src/screens/OrderConfirmationScreen.tsx
import React, { useEffect, useContext } from 'react';
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
import { CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticSuccess, hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsSecondary } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticSuccess();
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : '#F9F9F9';

  const handleContinue = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <CheckCircle size={80} color={jarsSecondary} />
        <Text style={[styles.title, { color: jarsSecondary }]}>
          Thank You!
        </Text>
        <Text style={styles.message}>
          Your order has been placed successfully.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: jarsSecondary }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: '700', marginVertical: 16 },
  message: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
