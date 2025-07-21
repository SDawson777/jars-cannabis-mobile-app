// src/screens/OrderHistoryScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
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
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderHistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

interface OrderSummary {
  id: string;
  date: string;
  total: number;
}

const sampleOrders: OrderSummary[] = [
  { id: '12345', date: '2025-07-14', total: 150 },
  { id: '67890', date: '2025-07-10', total: 85 },
];

export default function OrderHistoryScreen() {
  const navigation = useNavigation<OrderHistoryNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // dynamic background
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const handleSelect = (order: OrderSummary) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('OrderDetails', { order });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={sampleOrders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            android_ripple={{ color: '#DDD' }}
            onPress={() => handleSelect(item)}
          >
            <View>
              <Text style={[styles.id, { color: jarsPrimary }]}>Order #{item.id}</Text>
              <Text style={[styles.date, { color: jarsSecondary }]}>{item.date}</Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.total, { color: jarsPrimary }]}>${item.total.toFixed(2)}</Text>
              <ChevronRight color={jarsPrimary} size={20} />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  id: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 14, marginTop: 4 },
  right: { flexDirection: 'row', alignItems: 'center' },
  total: { fontSize: 16, fontWeight: '600', marginRight: 8 },
});
