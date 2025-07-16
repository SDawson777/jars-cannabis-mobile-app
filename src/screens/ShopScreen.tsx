// src/screens/ShopScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
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

type ShopNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShopScreen'
>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const sampleProducts = [
  { id: '1', name: 'Rainbow Rozay', price: 79.0, image: require('../assets/product1.png') },
  { id: '2', name: 'Moonwalker OG', price: 65.0, image: require('../assets/product2.png') },
];

export default function ShopScreen() {
  const navigation = useNavigation<ShopNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const [products] = useState(sampleProducts);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleProduct = (product: typeof sampleProducts[0]) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ProductDetails', { product });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={products}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handleProduct(item)}
            android_ripple={{ color: '#EEE' }}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={[styles.name, { color: jarsPrimary }]}>{item.name}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  image: { width: CARD_WIDTH - 24, height: CARD_WIDTH - 24, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 14, color: '#555' },
});
