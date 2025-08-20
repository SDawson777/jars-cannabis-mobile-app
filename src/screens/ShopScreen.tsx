// src/screens/ShopScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import CMSImage from '../components/CMSImage';
import OfflineNotice from '../components/OfflineNotice';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import useSkeletonText from '../components/useSkeletonText';
import { ThemeContext } from '../context/ThemeContext';
import { useFiltersQuery } from '../hooks/useFilters';
import { useProducts } from '../hooks/useProducts';
import type { RootStackParamList } from '../navigation/types';
import type { CMSProduct } from '../types/cms';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { toast } from '../utils/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ShopNavProp = NativeStackNavigationProp<RootStackParamList, 'ShopScreen'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ShopScreen() {
  const navigation = useNavigation<ShopNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useProducts('1');
  const products = data?.pages.flat() ?? [];
  const { data: filters, isLoading: filtersLoading } = useFiltersQuery();

  useEffect(() => {
    if (error) {
      toast('Failed to load products');
    }
  }, [error]);

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

  const handleProduct = (product: CMSProduct) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ProductDetail', {
      slug: (product as any)._id ?? (product as any).id ?? (product as any).slug,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <OfflineNotice />
      <View style={styles.filterRow}>
        {filtersLoading && (
          <>
            {useSkeletonText(60, 20)}
            {useSkeletonText(80, 20)}
          </>
        )}
        {!filtersLoading &&
          filters?.map(f => (
            <View key={f.id} style={[styles.filterChip, { borderColor: jarsPrimary }]}>
              \<Text style={{ color: jarsPrimary }}>{f.label}</Text>
            </View>
          ))}
      </View>
      {isLoading && products.length === 0 ? (
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} width={CARD_WIDTH} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => (item as any)._id ?? (item as any).id ?? (item as any).slug}
          numColumns={2}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                hapticMedium();
                refetch();
              }}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} /> : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                { borderColor: jarsPrimary, backgroundColor: '#FFF' },
                glowStyle,
              ]}
              onPress={() => handleProduct(item)}
              android_ripple={{ color: '#EEE' }}
            >
              {item.image && <CMSImage uri={item.image.url} alt={item.name} style={styles.image} />}
              <Text style={[styles.name, { color: jarsPrimary }]}>{item.name}</Text>
              <Text style={[styles.price, { color: jarsSecondary }]}>${item.price.toFixed(2)}</Text>
            </Pressable>
          )}
        />
      )}
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
