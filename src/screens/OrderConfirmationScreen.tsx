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
import { ChevronLeft, Home as HomeIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderConfirmationNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrderConfirmation'
>;

export default function OrderConfirmationScreen() {
  const navigation = useNavigation<OrderConfirmationNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <HomeIcon color={jarsPrimary} size={48} />
        <Text style={[styles.title, { color: jarsPrimary }]}>
          Thank you for your order!
        </Text>
        <Text style={styles.subtitle}>
          Your order is being processed and will be ready soon.
        </Text>
      </View>
      <Pressable
        style={[styles.button, { backgroundColor: jarsPrimary }]}
        onPress={() => {
          hapticMedium();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          navigation.navigate('HomeScreen');
        }}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 8 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
