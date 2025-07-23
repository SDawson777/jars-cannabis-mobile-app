import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight } from '../utils/haptic';

const LABELS = ['Relaxation', 'Focus', 'Pain Relief', 'Creativity', 'Sleep'];

type RouteProps = RouteProp<RootStackParamList, 'JournalEntry'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'JournalEntry'>;

export default function JournalEntryScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { jarsPrimary } = React.useContext(ThemeContext);

  const goBack = () => {
    hapticLight();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: jarsPrimary }]}>Journal Entry</Text>
      <Text style={styles.meta}>{params.item.name}</Text>
      {/* Placeholder for sliders and notes */}
      {LABELS.map(label => (
        <View key={label} style={styles.sliderRow}>
          <Text>{label}</Text>
        </View>
      ))}
      <Text style={styles.placeholder}>Notes input coming soon...</Text>
      <Text onPress={goBack} style={[styles.save, { color: jarsPrimary }]}>
        Save
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  meta: { fontSize: 16, marginBottom: 16 },
  sliderRow: { height: 40, justifyContent: 'center' },
  placeholder: { color: '#666', marginTop: 16 },
  save: { marginTop: 24, textAlign: 'right', fontSize: 16 },
});
