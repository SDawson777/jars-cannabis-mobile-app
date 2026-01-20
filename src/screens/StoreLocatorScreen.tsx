// src/screens/StoreLocatorScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useContext, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

import { ThemeContext } from '../context/ThemeContext';
import { useNearbyStores, Store } from '../hooks/useMapbox';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium } from '../utils/haptic';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LocatorNavProp = NativeStackNavigationProp<RootStackParamList, 'StoreLocator'>;

interface StoreItem {
  id: string;
  name: string;
  address: string;
}

export default function StoreLocatorScreen() {
  const navigation = useNavigation<LocatorNavProp>();
  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  // Fetch stores from API
  const {
    data: stores,
    isLoading,
    error,
  } = useNearbyStores({
    coordinates: coordinates || undefined,
    radiusMiles: 50,
  });

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Get user location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch {
        // Fall back to default coordinates if location unavailable
        setCoordinates({ latitude: 42.3314, longitude: -83.0458 }); // Detroit
      }
    })();
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleSelectStore = (store: StoreItem) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('StoreDetails', { store });
  };

  // Transform API store data to display format
  const storeItems: StoreItem[] = (stores || []).map((s: Store) => ({
    id: s.id,
    name: s.name,
    address: s.address,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: brandSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={brandPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: brandPrimary }]}>Store Locator</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={brandPrimary} />
          <Text style={[styles.loadingText, { color: brandSecondary }]}>Finding stores...</Text>
        </View>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: brandSecondary }]}>
            Unable to load stores. Please try again.
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !error && (
        <FlatList
          data={storeItems}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: brandSecondary }]}>
              No stores found nearby.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              android_ripple={{ color: `${brandSecondary}20` }}
              onPress={() => handleSelectStore(item)}
            >
              <View>
                <Text style={[styles.storeName, { color: brandPrimary }]}>{item.name}</Text>
                <Text style={[styles.storeAddress, { color: brandSecondary }]}>{item.address}</Text>
              </View>
            </Pressable>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16 },
  row: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  storeName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  storeAddress: { fontSize: 14 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', padding: 32 },
});
