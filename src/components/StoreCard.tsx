import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { hapticLight, hapticMedium } from '../utils/haptic';
import type { StoreData } from '../@types/store';

interface Props {
  store: StoreData;
  distanceLabel?: string;
  isPreferred?: boolean;
  onSelect(): void;
  onGetDirections(): void;
  onSetPreferred(): void;
  onViewDetails?(): void;
}

export default function StoreCard({
  store,
  distanceLabel,
  isPreferred,
  onSelect,
  onGetDirections,
  onSetPreferred,
  onViewDetails,
}: Props) {
  const handleSelect = () => {
    hapticLight();
    onSelect();
  };

  const handleDirections = () => {
    hapticMedium();
    onGetDirections();
  };

  const handlePreferred = () => {
    hapticMedium();
    onSetPreferred();
  };

  return (
    <Pressable style={styles.card} onPress={handleSelect}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{store.name}</Text>
        {isPreferred && <Star size={16} color="#8CD24C" />}
      </View>
      <Text style={styles.address}>{store.address}</Text>
      {distanceLabel && <Text style={styles.distance}>{distanceLabel}</Text>}
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={handleDirections}>
          <MapPin size={16} color="#2E5D46" />
          <Text style={styles.btnText}>Directions</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handlePreferred}>
          <Star size={16} color={isPreferred ? '#2E5D46' : '#AAA'} />
          <Text style={styles.btnText}>Preferred</Text>
        </Pressable>
        {onViewDetails && (
          <Pressable style={styles.button} onPress={onViewDetails}>
            <Text style={styles.btnText}>Details</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  address: { fontSize: 14, color: '#555' },
  distance: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 12 },
  button: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  btnText: { marginLeft: 4, color: '#2E5D46' },
});
