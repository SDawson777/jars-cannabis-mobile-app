import React, { useEffect, useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { useProductDetails } from '../hooks/useProductDetails';
import ProductFallback from '../components/ProductFallback';
import CMSImage from '../components/CMSImage';
import StockAlert from '../components/StockAlert';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RoutePropType = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<RoutePropType>();
  const { slug } = route.params;
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { preferredStore } = useStore();
  const { data, isLoading, refetch, isFetching, error } = useProductDetails(
    slug,
    preferredStore?.id
  );
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  if (isLoading && !data) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (!data || error) {
    return <ProductFallback onRetry={() => refetch()} loading={isFetching} />;
  }

  const { product, variants } = data;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <CMSImage uri={product.image.url} alt={product.name} style={styles.image} />
        {selectedVariant && variants.find(v => v.id === selectedVariant)?.stock === 0 && (
          <StockAlert message="Sold Out" />
        )}
        <Text style={[styles.name, { color: jarsPrimary }]}>{product.name}</Text>
        {variants.map(v => (
          <Pressable
            key={v.id}
            onPress={() => setSelectedVariant(v.id)}
            disabled={v.stock === 0}
            style={[
              styles.variant,
              selectedVariant === v.id && { borderColor: jarsPrimary },
              v.stock === 0 && styles.disabled,
            ]}
          >
            <Text style={{ color: jarsPrimary }}>{v.name}</Text>
            <Text style={{ color: jarsSecondary }}>${v.price.toFixed(2)}</Text>
            <Animated.Text style={styles.stock} key={`${v.id}-${v.stock}`} entering={BounceIn}>
              {v.stock} in stock
            </Animated.Text>
            {v.stock > 0 && v.stock <= 5 && <StockAlert message="Low stock" />}
          </Pressable>
        ))}
        {product.effects && <Text style={styles.effects}>{product.effects.join(', ')}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', padding: 16 },
  image: { width: '100%', aspectRatio: 1, borderRadius: 12, marginBottom: 12 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  variant: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '100%',
  },
  disabled: { opacity: 0.5 },
  stock: { fontSize: 12 },
  effects: { fontSize: 14, textAlign: 'center' },
});
