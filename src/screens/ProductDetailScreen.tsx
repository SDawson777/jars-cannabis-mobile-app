import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { useCMSProducts } from '../hooks/useCMSProducts';
import CMSImage from '../components/CMSImage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<RoutePropType>();
  const { slug } = route.params;
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { data, isLoading } = useCMSProducts();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  if (isLoading || !data) {
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

  const product = data.find(p => p.slug === slug);
  if (!product) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor },
        ]}
      >
        <Text>Product not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <CMSImage uri={product.image.url} alt={product.name} style={styles.image} />
        <Text style={[styles.name, { color: jarsPrimary }]}>{product.name}</Text>
        <Text style={[styles.price, { color: jarsSecondary }]}>${product.price.toFixed(2)}</Text>
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
  effects: { fontSize: 14, textAlign: 'center' },
});
