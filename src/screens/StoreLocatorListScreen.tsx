import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import StoreCard from '../components/StoreCard';
import type { StoreData } from '../@types/store';

const STORES: StoreData[] = [
  {
    id: '1',
    name: 'Jars Downtown',
    slug: 'downtown',
    latitude: 42.3314,
    longitude: -83.0458,
    address: '123 Main St',
    city: 'Detroit',
    state: 'MI',
    zip: '48226',
    phone: '555-123-4567',
    openNow: true,
    todayHours: 'Open until 9 PM',
    weeklyHours: [],
    amenities: [],
  },
];

type NavProp = NativeStackNavigationProp<RootStackParamList, 'StoreLocatorList'>;

export default function StoreLocatorListScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <FlatList
        data={STORES}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onSelect={() => navigation.navigate('StoreDetails', { store: item })}
            onGetDirections={() => {}}
            onSetPreferred={() => {}}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
