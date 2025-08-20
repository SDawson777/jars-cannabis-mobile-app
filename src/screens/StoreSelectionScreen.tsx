import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Pressable, Image, StyleSheet } from 'react-native';

import Illustration from '../../assets/svg/illustration-no-nearby-stores.svg';
import { onProximityAlert } from '../../tasks/locationWatcher';
import { phase4Client } from '../api/phase4Client';
import AnimatedPulseGlow from '../components/AnimatedPulseGlow';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import LocationStatusDisplay from '../components/LocationStatusDisplay';
import PermissionRationaleModal from '../components/PermissionRationaleModal';
import StoreCard from '../components/StoreCard';
import { useStore } from '../context/StoreContext';
import { RootStackParamList } from '../navigation/types';
import { hapticMedium, hapticHeavy } from '../utils/haptic';



interface ApiStore {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const PROXIMITY_RADIUS_METERS = 100;

const toRad = (value: number) => (value * Math.PI) / 180;

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'StoreSelection'>;

export default function StoreSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { setPreferredStore } = useStore();

  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  );
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<ApiStore[] | null>(null);


  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    return status === 'granted';
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        // timeout removed - implement manually if needed
      });
      const res = await phase4Client.get(
        `/api/v1/stores?latitude=${coords.latitude}&longitude=${coords.longitude}&sort_by=distance&radius=50`
      );
      const fetchedStores: ApiStore[] = res.data?.stores || [];
      setStores(fetchedStores);
      hapticMedium();

      const alertsEnabled = (await AsyncStorage.getItem('visitAlerts')) === 'true';
      if (alertsEnabled) {
        for (const s of fetchedStores) {
          const distance = getDistance(
            coords.latitude,
            coords.longitude,
            s.latitude,
            s.longitude
          );
          if (distance <= PROXIMITY_RADIUS_METERS) {
            await onProximityAlert(s.id, distance);
          }
        }
      }
    } catch (_e) {
      hapticHeavy();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (granted) await fetchStores();
    })();
  }, []);

  const handleSelect = (store: ApiStore) => {
    setPreferredStore(store as any);
    navigation.replace('HomeScreen');
  };

  if (permission === 'undetermined') {
    return (
      <PermissionRationaleModal
        isVisible
        onConfirm={() => {
          requestPermission().then(granted => {
            if (granted) fetchStores();
          });
        }}
        onDeny={() => setPermission('denied')}
      />
    );
  }

  if (permission === 'denied') {
    return (
      <LocationStatusDisplay
        status="denied"
        onRetry={() =>
          requestPermission().then(granted => {
            if (granted) fetchStores();
          })
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <AnimatedPulseGlow />
          <Text style={styles.loadingText}>Locating nearest stores…</Text>
        </View>
      )}
      {!loading && stores && stores.length === 0 && (
        <View style={styles.emptyContainer}>
          <Image source={Illustration} style={styles.illustration} />
          <Text style={styles.emptyText}>No nearby stores</Text>
          <CustomAudioPlayer source={require('../../assets/audio/empty_state_sigh.mp3')} play />
          <Pressable onPress={() => navigation.navigate('StoreLocator')}>
            <Text style={styles.link}>Search All Locations</Text>
          </Pressable>
        </View>
      )}
      {!loading && stores && stores.length > 0 && (
        <FlatList
          data={stores}
          keyExtractor={s => s.id}
          renderItem={({ item }) => (
            <StoreCard
              store={item as any}
              onSelect={() => handleSelect(item)}
              onGetDirections={() => {}}
              onSetPreferred={() => {}}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  illustration: { width: 200, height: 200, marginBottom: 20, resizeMode: 'contain' },
  emptyText: { fontSize: 18, marginBottom: 12 },
  link: { color: '#2E5D46', marginTop: 8 },
});
