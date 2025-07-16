// src/screens/OrderHistoryScreen.tsx
import React, { useContext, useState, useEffect } from 'react';
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
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const orders = [
  { id: '12345', date: '2025-07-14', status: 'Delivered', total: 209.0 },
  { id: '12344', date: '2025-07-10', status: 'Processing', total: 65.0 },
];

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsBackground, jarsPrimary } = useContext(ThemeContext);
  const [data] = useState(orders);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handlePress = (order: any) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('OrderDetails', { order });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => handlePress(item)}
          >
            <View>
              <Text style={[styles.id, { color: jarsPrimary }]}>
                #{item.id}
              </Text>
              <Text style={styles.meta}>
                {item.date} · {item.status}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.total}>${item.total.toFixed(2)}</Text>
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
    borderBottomColor: '#EEE',
  },
  id: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, color: '#555' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  total: { fontSize: 16, marginRight: 8 },
});
