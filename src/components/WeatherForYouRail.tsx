import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';

import { useWeatherRecommendations } from '../hooks/useWeatherRecommendations';
import { hapticLight } from '../utils/haptic';
import { logEvent } from '../utils/analytics';
import type { CMSProduct } from '../types/cms';
import ProductCardMini from './ProductCardMini';

interface WeatherForYouRailProps {
  condition?: string;
  city?: string;
  state?: string;
  limit?: number;
  onSelectProduct: (productId: string) => void;
  onSeeAll?: () => void;
  showEmptyState?: boolean;
}

export default function WeatherForYouRail({
  condition,
  city,
  state,
  limit = 8,
  onSelectProduct,
  onSeeAll,
  showEmptyState = true,
}: WeatherForYouRailProps) {
  const { data, isLoading, error, refetch } = useWeatherRecommendations({
    condition,
    city,
    state,
    limit,
    enabled: !!condition,
  });

  // Convert CMSProduct to ForYouTodayItem format expected by ProductCardMini
  const formattedProducts = useMemo(() => {
    if (!data?.products) return [];

    return data.products.map((product: CMSProduct) => ({
      id: product.__id,
      name: product.name,
      price: product.price || 0,
      imageUrl: product.image?.url || undefined,
    }));
  }, [data?.products]);

  const handleSeeAll = () => {
    hapticLight();

    // Track "See All" click event
    logEvent('weather_recs_view_all', {
      weather_condition: condition,
      location: city && state ? `${city}, ${state}` : undefined,
      product_count: data?.products?.length || 0,
      tags: data?.tags || [],
    });

    onSeeAll?.();
  };

  const handleProductPress = (productId: string) => {
    const product = data?.products?.find(p => p.__id === productId);

    // Track product click event
    logEvent('weather_recs_click', {
      weather_condition: condition,
      product_id: productId,
      product_name: product?.name,
      product_type: product?.type,
      product_price: product?.price,
      location: city && state ? `${city}, ${state}` : undefined,
      tags: data?.tags || [],
    });

    onSelectProduct(productId);
  };

  // Track view event when recommendations load successfully
  useEffect(() => {
    if (data && data.products && data.products.length > 0) {
      logEvent('weather_recs_view', {
        weather_condition: condition,
        location: city && state ? `${city}, ${state}` : undefined,
        product_count: data.products.length,
        tags: data.tags || [],
        description: data.description,
      });
    }
  }, [data, condition, city, state]);

  // Don't render if no condition provided
  if (!condition) {
    return null;
  }

  // Don't render if error and not showing empty state
  if (error && !showEmptyState) {
    return null;
  }

  // Don't render if no data and not showing empty state or loading
  if (!data && !isLoading && !showEmptyState) {
    return null;
  }

  const weatherEmoji = getWeatherEmoji(condition);
  const title = data?.description || `Weather picks for ${condition}`;

  return (
    <View style={styles.container} testID="weather-for-you-rail">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{weatherEmoji}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {data?.products && data.products.length > 0 && onSeeAll && (
          <Pressable onPress={handleSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        )}
      </View>

      {data?.tags && data.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {data.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E5D46" />
          <Text style={styles.loadingText}>Finding perfect picks...</Text>
        </View>
      )}

      {error && showEmptyState && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load weather recommendations</Text>
          <Pressable onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !error && formattedProducts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {formattedProducts.map(product => (
            <ProductCardMini
              key={product.id}
              item={product}
              onPress={() => handleProductPress(product.id)}
            />
          ))}
        </ScrollView>
      )}

      {!isLoading && !error && formattedProducts.length === 0 && showEmptyState && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recommendations available for {condition} weather</Text>
        </View>
      )}
    </View>
  );
}

function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes('sunny') || conditionLower.includes('sun')) return '☀️';
  if (conditionLower.includes('clear')) return '🌤️';
  if (conditionLower.includes('partly cloudy')) return '⛅';
  if (conditionLower.includes('cloudy')) return '☁️';
  if (conditionLower.includes('overcast')) return '🌫️';
  if (conditionLower.includes('rain')) return '🌧️';
  if (conditionLower.includes('snow')) return '❄️';
  if (conditionLower.includes('thunder')) return '⛈️';

  return '🌤️'; // Default
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    color: '#2E5D46',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F7F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2E5D46',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#F0F7F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#2E5D46',
    fontWeight: '500',
  },
  scrollView: {
    marginTop: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
