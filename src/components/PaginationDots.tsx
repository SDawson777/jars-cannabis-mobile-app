import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  current: number;
  total: number;
}

export default function PaginationDots({ current, total }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: '#ccc' },
  active: { backgroundColor: '#2E5D46' },
});
