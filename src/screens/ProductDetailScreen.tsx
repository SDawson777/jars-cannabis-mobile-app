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
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Heart, ShoppingCart } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<{ params: { product: any } }>();
  const product = params?.product || {
    id: '1',
    name: 'Rainbow Rozay',
    description: 'A bright, uplifting sativa.',
    price: 79.0,
    image: require('../assets/product1.png'),
    favorited: false,
  };
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

  const handleFavorite = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: toggle favorite state
  };

  const handleAddToCart = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('CartScreen', { add: product });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
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
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.description}>{product.description}</Text>
      </ScrollView>

      <Pressable
        style={[styles.cartBtn, { backgroundColor: jarsPrimary }]}
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
  },
  content: { alignItems: 'center', padding: 16 },
  image: { width: 200, height: 200, borderRadius: 16, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 16, color: '#555', textAlign: 'center' },
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
