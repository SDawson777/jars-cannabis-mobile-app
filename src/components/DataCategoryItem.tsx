import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DataCategory } from '../api/hooks/useDataCategories';

export default function DataCategoryItem({ category }: { category: DataCategory }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={category.label}
    >
      <Text style={styles.label}>{category.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
  },
  label: { fontSize: 16 },
});
