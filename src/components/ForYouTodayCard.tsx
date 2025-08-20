import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import type { ForYouTodayPayload } from '../@types/personalization';

import ProductCardMini from './ProductCardMini';

interface Props {
  data: ForYouTodayPayload;
  onSelectProduct: (_id: string) => void;
  onSeeAll?: () => void;
}

export default function ForYouTodayCard({ data, onSelectProduct, onSeeAll }: Props) {
  return (
    <View style={styles.card} testID="for-you-today-card">
      <Text style={styles.greeting}>{data.greeting}</Text>
      <Text style={styles.message}>{data.message}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {data.products.map(p => (
          <ProductCardMini key={p.id} item={p} onPress={() => onSelectProduct(p.id)} />
        ))}
      </ScrollView>
      {data.ctaText && (
        <Text style={styles.cta} onPress={onSeeAll}>
          {data.ctaText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  greeting: { fontSize: 18, fontWeight: '600', color: '#333' },
  message: { fontSize: 16, color: '#333', marginTop: 4 },
  row: { marginTop: 12 },
  cta: { marginTop: 12, fontSize: 14, color: '#2E5D46', fontWeight: '500' },
});
