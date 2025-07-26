// src/screens/ShopScreen.tsx
import React, { useEffect, useContext, useState } from 'react';
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
import { TERPENES } from '../terpene_wheel/data/terpenes';
import { hapticLight } from '../utils/haptic';
import { useFiltersQuery } from '../hooks/useFilters';
import useSkeletonText from '../components/useSkeletonText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ShopNavProp = NativeStackNavigationProp<RootStackParamList, 'ShopScreen'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const sampleProducts = [
  {
    id: '1',
    name: 'Rainbow Rozay',
    price: 79.0,
    image: require('../assets/product1.png'),
    description: 'A flavorful hybrid with fruity notes.',
    terpenes: TERPENES,
  },
  {
    id: '2',
    name: 'Moonwalker OG',
    price: 65.0,
    image: require('../assets/product2.png'),
    description: 'Potent indica leaning strain for relaxation.',
    terpenes: TERPENES,
  },
];

export default function ShopScreen() {
  const navigation = useNavigation<ShopNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const [products] = useState(sampleProducts);
  const { data: filters, isLoading: filtersLoading } = useFiltersQuery();

  // animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // dynamic background
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  // glow for product cards
  const glowStyle =
    colorTemp === 'warm'
      ? {
          shadowColor: jarsPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }
      : colorTemp === 'cool'
        ? {
            shadowColor: '#00A4FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }
        : {};

  const handleProduct = (product: (typeof sampleProducts)[0]) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ProductDetail', { slug: product.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.filterRow}>
        {filtersLoading && (
          <>
            {useSkeletonText(60, 20)}
            {useSkeletonText(80, 20)}
          </>
        )}
        {!filtersLoading &&
          filters?.map(f => (
            <View key={f.id} style={[styles.filterChip, { borderColor: jarsPrimary }]}>\
              <Text style={{ color: jarsPrimary }}>{f.label}</Text>
            </View>
          ))}
      </View>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor: jarsPrimary, backgroundColor: '#FFF' }, glowStyle]}
            onPress={() => handleProduct(item)}
            android_ripple={{ color: '#EEE' }}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={[styles.name, { color: jarsPrimary }]}>{item.name}</Text>
            <Text style={[styles.price, { color: jarsSecondary }]}>${item.price.toFixed(2)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 16 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  list: { padding: 16 },
  card: {
    width: CARD_WIDTH,
    margin: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  image: {
    width: CARD_WIDTH - 24,
    height: CARD_WIDTH - 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '500' },
});
