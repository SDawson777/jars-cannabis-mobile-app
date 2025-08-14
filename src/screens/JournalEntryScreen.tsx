import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight } from '../utils/haptic';
import { addJournal } from '../api/phase4Client';

const LABELS = ['Relaxation', 'Focus', 'Pain Relief', 'Creativity', 'Sleep'];

type RouteProps = RouteProp<RootStackParamList, 'JournalEntry'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'JournalEntry'>;

export default function JournalEntryScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { jarsPrimary } = React.useContext(ThemeContext);

  const [values, setValues] = React.useState(
    LABELS.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l]: 0 }), {})
  );
  const [notes, setNotes] = React.useState('');

  const handleChange = (label: string, val: number) => {
    setValues(v => ({ ...v, [label]: val }));
  };

  const goBack = () => {
    hapticLight();
    navigation.goBack();
  };

  const saveEntry = async () => {
    hapticLight();
    try {
      const rating =
        Object.values(values).reduce((a, b) => a + b, 0) / LABELS.length;
      await addJournal({
        productId: params.item.id,
        rating,
        notes,
        tags: LABELS.filter(l => values[l] > 0),
      });
    } catch (e) {
      // ignore
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: jarsPrimary }]}>Journal Entry</Text>
      <Text style={styles.meta}>{params.item.name}</Text>
      {LABELS.map(label => (
        <View key={label} style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>{label}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={values[label]}
            minimumTrackTintColor={jarsPrimary}
            onValueChange={v => handleChange(label, v)}
          />
          <Text style={styles.sliderValue}>{values[label]}</Text>
        </View>
      ))}
      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={styles.notes}
      />
      <Text onPress={saveEntry} style={[styles.save, { color: jarsPrimary }]}>
        Save
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  meta: { fontSize: 16, marginBottom: 16 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  sliderLabel: { width: 100 },
  slider: { flex: 1, marginHorizontal: 8 },
  sliderValue: { width: 24, textAlign: 'right' },
  notes: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    height: 80,
    textAlignVertical: 'top',
    marginTop: 16,
  },
  save: { marginTop: 24, textAlign: 'right', fontSize: 16 },
});
