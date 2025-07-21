// src/screens/StoreSelection.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type StoreSelectionNavProp = NativeStackNavigationProp<RootStackParamList, 'StoreSelection'>;

const STORES = [
  { id: '1', name: 'Jars Downtown', subtitle: '123 Main St' },
  { id: '2', name: 'Jars Midtown', subtitle: '456 Elm St' },
  { id: '3', name: 'Jars Eastside', subtitle: '789 Pine Ave' },
];

export default function StoreSelection() {
  const navigation = useNavigation<StoreSelectionNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const selectStore = (id: string) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.replace('HomeScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: jarsPrimary }]}>Select Your Store</Text>
      <FlatList
        data={STORES}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor: jarsPrimary }]}
            onPress={() => selectStore(item.id)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  list: { paddingBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#555555' },
});
