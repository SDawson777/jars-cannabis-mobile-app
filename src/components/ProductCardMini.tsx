import React from 'react';
import { Text, Image, Pressable, StyleSheet } from 'react-native';

import type { ForYouTodayItem } from '../@types/personalization';
import { hapticLight } from '../utils/haptic';

interface Props {
  item: ForYouTodayItem;
  onPress(): void;
}

export default function ProductCardMini({ item, onPress }: Props) {
  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <Pressable style={styles.card} onPress={handlePress} testID="product-card-mini">
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
