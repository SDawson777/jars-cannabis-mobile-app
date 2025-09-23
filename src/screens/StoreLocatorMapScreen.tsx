import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, List } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

import type { StoreData } from '../@types/store';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight } from '../utils/haptic';

const STORES: StoreData[] = [
  {
    id: '1',
    name: 'Jars Downtown',
    slug: 'downtown',
    latitude: 42.3314,
    longitude: -83.0458,
    address: '123 Main St',
    city: 'Detroit',
    _state: 'MI',
    zip: '48226',
    phone: '555-123-4567',
    openNow: true,
    todayHours: 'Open until 9 PM',
    weeklyHours: [],
    amenities: [],
  },
];

type NavProp = NativeStackNavigationProp<RootStackParamList, 'StoreLocatorMap'>;

export default function StoreLocatorMapScreen() {
  const navigation = useNavigation<NavProp>();
  const [region] = useState<Region>({
    latitude: STORES[0].latitude,
    longitude: STORES[0].longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const goToList = () => {
    hapticLight();
    navigation.navigate('StoreLocatorList');
  };

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} region={region}>
        {STORES.map(s => (
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }}>
            <MapPin color="#2E5D46" />
          </Marker>
        ))}
      </MapView>
      <Pressable style={styles.listBtn} onPress={goToList}>
        <List color="#2E5D46" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
