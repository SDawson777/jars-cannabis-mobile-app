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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

type OrderTrackingNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrderTracking'
>;
type OrderTrackingRouteProp = RouteProp<RootStackParamList, 'OrderTracking'>;

export default function OrderTrackingScreen() {
  const navigation = useNavigation<OrderTrackingNavProp>();
  const route = useRoute<OrderTrackingRouteProp>();
  const status = route.params?.status ?? 'Shipped';
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

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
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Track Order
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {steps.map((label, idx) => {
          const done = steps.indexOf(status) >= idx;
          return (
            <View key={label} style={styles.stepRow}>
              <View
                style={[
                  styles.dot,
                  done && { backgroundColor: jarsPrimary },
                ]}
              />
              <Text
                style={[
                  styles.stepLabel,
                  done
                    ? { color: jarsPrimary }
                    : { color: jarsSecondary },
                ]}
              >
                {label}
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
    borderBottomWidth: 1,
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
  stepLabel: { fontSize: 16 },
});
