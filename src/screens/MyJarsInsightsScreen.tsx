import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function MyJarsInsightsScreen() {
  const { jarsPrimary } = React.useContext(ThemeContext);
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: jarsPrimary }]}>Insights</Text>
      <Text style={styles.placeholder}>Charts coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  placeholder: { color: '#666' },
});
