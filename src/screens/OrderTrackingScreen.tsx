// src/screens/OrderTrackingScreen.tsx
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const status = (params as any).status || 'Shipped';
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

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Track Order
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {steps.map((step, idx) => {
          const done = steps.indexOf(status) >= idx;
          return (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.dot,
                  done && { backgroundColor: jarsPrimary },
                ]}
              />
              <Text style={[styles.stepLabel, done && { color: jarsPrimary }]}>
                {step}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  stepLabel: { fontSize: 16, color: '#333' },
});
