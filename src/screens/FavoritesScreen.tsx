// src/screens/FavoritesScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Heart as HeartIcon } from 'lucide-react-native';
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { useFavoriteProducts, useRemoveFromFavorites, FavoriteItem } from '../hooks/useFavorites';
import type { RootStackParamList } from '../navigation/types';
import { hapticMedium, hapticLight } from '../utils/haptic';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FavoritesNavProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesNavProp>();
  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);

  // Fetch favorites from API
  const { data: favorites, isLoading, error } = useFavoriteProducts();
  const removeFavorite = useRemoveFromFavorites();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [favorites]);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const toggleFav = (favoriteId: string) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    removeFavorite.mutate(favoriteId);
  };

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: brandSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={brandPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: brandPrimary }]}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={brandPrimary} />
          <Text style={[styles.loadingText, { color: brandSecondary }]}>Loading favorites...</Text>
        </View>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: brandSecondary }]}>
            Unable to load favorites. Please try again.
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !error && (
        <FlatList
          data={favorites || []}
          keyExtractor={(item: FavoriteItem) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: brandSecondary }]}>
                No favorites yet. Start adding your favorite products!
              </Text>
            </View>
          }
          renderItem={({ item }: { item: FavoriteItem }) => (
            <View style={[styles.row, { borderBottomColor: brandSecondary }]}>
              <Text style={[styles.name, { color: brandPrimary }]}>
                {item.item?.name || 'Product'}
              </Text>
              <Pressable onPress={() => toggleFav(item.id)}>
                <HeartIcon color={brandPrimary} size={24} fill={brandPrimary} />
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  name: { fontSize: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
