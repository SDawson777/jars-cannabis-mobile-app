// src/screens/HomeScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  MapPin,
  ChevronDown,
  Search,
  Heart,
  ShoppingCart,
  User,
  Home,
  Menu,
} from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';
import ForYouTodayCard from '../components/ForYouTodayCard';
import { useForYouToday } from '../hooks/useForYouToday';
import { TERPENES } from '../terpene_wheel/data/terpenes';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

const categories = [
  { id: 'flower', label: 'Flower', emoji: '🌿' },
  { id: 'vapes', label: 'Vapes', emoji: '💨' },
  { id: 'edibles', label: 'Edibles', emoji: '🍪' },
  { id: 'pre-rolls', label: 'Pre-rolls', emoji: '🚬' },
  { id: 'concentrates', label: 'Concentrates', emoji: '🛢️' },
  { id: 'gear', label: 'Gear', emoji: '🧰' },
];

const featured = [
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

const ways = [
  { id: 'deals', label: 'Shop Deals' },
  { id: 'popular', label: 'Shop Popular' },
  { id: 'effects', label: 'Shop Effects' },
  { id: 'deli', label: 'Shop The Deli' },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { data: forYou } = useForYouToday('1', '1');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const openCart = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('CartScreen');
  };

  const openProfile = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <View style={styles.actions}>
            <Pressable onPress={() => navigation.navigate('Favorites')} style={styles.iconBtn}>
              <Heart color="#333" size={24} />
            </Pressable>
            <Pressable onPress={openCart} style={styles.iconBtn}>
              <ShoppingCart color="#333" size={24} />
            </Pressable>
            <Pressable onPress={openProfile} style={styles.iconBtn}>
              <User color="#333" size={24} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.locationRow}>
          <MapPin color={jarsPrimary} size={16} />
          <Text style={styles.pickupText}>Pickup from:</Text>
          <Text style={styles.locationText}>Downtown</Text>
          <ChevronDown color="#777" size={16} />
        </Pressable>

        <View style={styles.searchRow}>
          <Search color="#777" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search Products"
            placeholderTextColor="#777"
            style={styles.searchInput}
          />
          <Pressable style={[styles.searchBtn, { backgroundColor: jarsPrimary }]}>
            <Text style={styles.searchBtnText}>Search</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Price Drop</Text>
          <Text style={styles.heroSub}>New Everyday Low Pricing</Text>
          <Pressable style={styles.heroBtn}>
            <Text style={[styles.heroBtnText, { color: jarsPrimary }]}>Shop Deli</Text>
          </Pressable>
        </View>

        {forYou && (
          <ForYouTodayCard
            data={forYou}
            onSelectProduct={id => navigation.navigate('ProductDetails', { product: { id } })}
            onSeeAll={() => navigation.navigate('ShopScreen')}
          />
        )}

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Shop By Categories</Text>
          <Pressable onPress={() => navigation.navigate('ShopScreen')}>
            <Text style={[styles.seeMore, { color: jarsPrimary }]}>See More</Text>
          </Pressable>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => navigation.navigate('ShopScreen')}
              style={styles.categoryCard}
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Featured Products</Text>
          <Pressable onPress={() => navigation.navigate('ShopScreen')}>
            <Text style={[styles.seeMore, { color: jarsPrimary }]}>Shop All</Text>
          </Pressable>
        </View>
        <View style={styles.productGrid}>
          {featured.map(item => (
            <Pressable
              key={item.id}
              style={[styles.productCard, { borderColor: jarsPrimary }]}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
              <Image source={item.image} style={styles.productImage} />
              <Text style={[styles.productName, { color: jarsPrimary }]}>{item.name}</Text>
              <Text style={[styles.productPrice, { color: jarsSecondary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Your Weed Your Way */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Your Weed Your Way</Text>
          <Pressable onPress={() => navigation.navigate('ShopScreen')}>
            <Text style={[styles.seeMore, { color: jarsPrimary }]}>See More</Text>
          </Pressable>
        </View>
        <View style={styles.waysGrid}>
          {ways.map(w => (
            <Pressable
              key={w.id}
              onPress={() => navigation.navigate('ShopScreen')}
              style={styles.wayCard}
            >
              <View style={styles.wayImage} />
              <Text style={styles.wayLabel}>{w.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable onPress={() => navigation.navigate('HomeScreen')} style={styles.navItem}>
          <Home color={jarsPrimary} size={24} />
          <Text style={[styles.navLabel, { color: jarsPrimary }]}>Home</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('ShopScreen')} style={styles.navItem}>
          <Menu color="#666" size={24} />
          <Text style={styles.navLabel}>Shop</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Favorites')} style={styles.navItem}>
          <Heart color="#666" size={24} />
          <Text style={styles.navLabel}>Deals</Text>
        </Pressable>
        <Pressable onPress={openCart} style={styles.navItem}>
          <ShoppingCart color="#666" size={24} />
          <Text style={styles.navLabel}>Cart</Text>
        </Pressable>
        <Pressable onPress={openProfile} style={styles.navItem}>
          <User color="#666" size={24} />
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 32, height: 32 },
  actions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  pickupText: { marginLeft: 4, fontSize: 14 },
  locationText: { marginLeft: 4, fontSize: 14, color: '#333' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  searchIcon: { marginLeft: 8, position: 'absolute' },
  searchInput: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 36,
    fontSize: 15,
  },
  searchBtn: { marginLeft: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  scroll: { paddingBottom: 80 },
  hero: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#2E5D46',
    marginHorizontal: 16,
    marginTop: 16,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  heroSub: { color: '#FFFFFF', fontSize: 18, marginBottom: 12 },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
  },
  heroBtnText: { fontSize: 16, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  seeMore: { fontSize: 14, fontWeight: '500' },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  categoryCard: { width: '30%', alignItems: 'center', marginBottom: 16 },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: 14 },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  productImage: { width: '100%', height: 120, borderRadius: 12, marginBottom: 8 },
  productName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: '700' },
  waysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  wayCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wayImage: { width: 96, height: 96, backgroundColor: '#EEE', borderRadius: 12, marginBottom: 8 },
  wayLabel: { fontSize: 14, fontWeight: '500' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 8,
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#666', marginTop: 4 },
});
