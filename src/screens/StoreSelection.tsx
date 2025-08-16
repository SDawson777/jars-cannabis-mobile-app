// src/screens/StoreSelection.tsx
import React, { useEffect, useContext, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  SafeAreaView,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  View,
  Image,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import AnimatedPulseGlow from '../components/AnimatedPulseGlow';
import StoreCard from '../components/StoreCard';
import PermissionRationaleModal from '../components/PermissionRationaleModal';
import LocationStatusDisplay from '../components/LocationStatusDisplay';
import EmptyStateSVG from '../assets/svg/illustration-no-nearby-stores.svg';
import { usePreferredStore } from '../state/store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { StoreData } from '../@types/store';
import { hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type StoreSelectionNavProp = NativeStackNavigationProp<RootStackParamList, 'StoreSelection'>;

export default function StoreSelection() {
  const navigation = useNavigation<StoreSelectionNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const { setPreferredStore } = usePreferredStore();

  const [permissionStatus, setPermissionStatus] = useState<'loading' | 'granted' | 'denied'>(
    'loading'
  );
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [locationError, setLocationError] = useState('');
  const [showRationale, setShowRationale] = useState(true);

  const requestAndFetch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');
      setIsLoadingStores(true);
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const res = await globalThis.fetch(
        `/api/v1/stores?latitude=${coords.latitude}&longitude=${coords.longitude}&sort_by=distance&radius=50`
      );
      const json = await res.json();
      setStores(json?.stores || []);
    } catch (e) {
      globalThis.console.error(e);
      setLocationError('Could not fetch stores');
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const selectStore = (store: StoreData) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPreferredStore(store);
    SecureStore.setItemAsync('preferredStore', JSON.stringify(store));
    navigation.replace('HomeScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: jarsPrimary }]}>Select Your Store</Text>
      {showRationale && permissionStatus === 'loading' && (
        <PermissionRationaleModal
          isVisible
          onConfirm={() => {
            setShowRationale(false);
            requestAndFetch();
          }}
          onDeny={() => {
            setShowRationale(false);
            setPermissionStatus('denied');
          }}
        />
      )}
      {permissionStatus === 'loading' && !showRationale && (
        <View style={styles.center}>
          <AnimatedPulseGlow />
          <Text style={styles.loadingText}>Locating nearest stores…</Text>
          {[1, 2, 3].map(i => (
            <StoreCard
              key={i}
              store={{} as any}
              isLoading
              onSelect={() => {}}
              onGetDirections={() => {}}
              onSetPreferred={() => {}}
            />
          ))}
        </View>
      )}
      {permissionStatus === 'denied' && (
        <LocationStatusDisplay status="denied" onRetry={requestAndFetch} />
      )}
      {locationError !== '' && permissionStatus === 'granted' && !isLoadingStores && (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{locationError}</Text>
          <Pressable onPress={requestAndFetch} accessibilityRole="button">
            <Text style={styles.link}>Retry</Text>
          </Pressable>
        </View>
      )}
      {permissionStatus === 'granted' && !isLoadingStores && stores.length === 0 && (
        <View style={styles.emptyContainer}>
          <Image source={EmptyStateSVG} style={styles.illustration} />
          <Text style={styles.emptyText}>No nearby stores</Text>
          <Pressable onPress={() => navigation.navigate('StoreLocator')}>
            <Text style={styles.link}>Search All Locations</Text>
          </Pressable>
        </View>
      )}
      {stores.length > 0 && (
        <FlatList
          data={stores}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              onSelect={() => selectStore(item)}
              onGetDirections={() => {}}
              onSetPreferred={() => selectStore(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  list: { paddingBottom: 16 },
  center: { alignItems: 'center' },
  loadingText: { marginVertical: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  illustration: { width: 200, height: 200, resizeMode: 'contain', marginBottom: 20 },
  emptyText: { fontSize: 18, marginBottom: 8 },
  link: { color: '#2E5D46', marginTop: 8 },
});
