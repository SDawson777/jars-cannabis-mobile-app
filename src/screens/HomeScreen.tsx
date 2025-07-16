// src/screens/HomeScreen.tsx
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
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
        <Text style={[styles.welcome, { color: jarsPrimary }]}>
          Welcome back!
        </Text>
        <Pressable
          style={[styles.card, { borderColor: jarsPrimary }]}
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.navigate('ShopScreen');
          }}
        >
          <Text style={[styles.cardText, { color: jarsPrimary }]}>
            Shop Now
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: '600', marginBottom: 24 },
  card: {
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
  },
  cardText: { fontSize: 18, fontWeight: '600' },
});
