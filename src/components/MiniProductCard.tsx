import React from 'react';
import { Text, Image, Pressable, StyleSheet } from 'react-native';
import type { MiniProduct } from '../types/personalization';
import { hapticLight } from '../utils/haptic';

interface Props {
  item: MiniProduct;
  onPress(): void;
  testID?: string;
}

export default function MiniProductCard({ item, onPress, testID }: Props) {
  const handle = () => {
    hapticLight();
    onPress();
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handle}
      testID={testID || 'mini-product-card'}
      accessibilityLabel={item.name}
    >
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: '100%', height: 100, borderRadius: 12, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '600', color: '#333' },
  price: { fontSize: 14, fontWeight: '700', color: '#2E5D46' },
});
