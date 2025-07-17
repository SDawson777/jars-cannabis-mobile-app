// src/screens/ProductDetailScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, Heart, ShoppingCart } from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ProductDetailsNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductDetails'
>;
type ProductDetailsRouteProp = RouteProp<
  RootStackParamList,
  'ProductDetails'
>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<ProductDetailsNavProp>();
  const route = useRoute<ProductDetailsRouteProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const product = route.params.product;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Dynamic background
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  // Glow for Add to Cart button
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

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleFavorite = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: toggle favorite
  };

  const handleAddToCart = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('CartScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Pressable onPress={handleFavorite}>
          <Heart color={jarsPrimary} size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={product.image} style={styles.image} />
        <Text style={[styles.name, { color: jarsPrimary }]}>
          {product.name}
        </Text>
        <Text style={[styles.price, { color: jarsSecondary }]}>
          ${product.price.toFixed(2)}
        </Text>
        <Text style={[styles.description, { color: jarsSecondary }]}>
          {product.description}
        </Text>
      </ScrollView>

      <Pressable
        style={[styles.cartBtn, { backgroundColor: jarsPrimary }, glowStyle]}
        onPress={handleAddToCart}
      >
        <ShoppingCart color="#FFFFFF" size={20} />
        <Text style={styles.cartBtnText}>Add to Cart</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: { alignItems: 'center', padding: 16 },
  image: { width: 200, height: 200, borderRadius: 16, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    margin: 16,
    borderRadius: 12,
  },
  cartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
