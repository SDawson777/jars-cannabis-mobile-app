import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart } from 'lucide-react-native';
import StashItemCard from '../components/StashItemCard';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';
import type { StashItem } from '../@types/jars';

const SAMPLE_ITEMS: StashItem[] = [
  {
    id: '1',
    name: 'Blue Dream',
    strainType: 'Hybrid',
    purchaseDate: '2025-07-20',
    status: 'in_stock',
  },
];

type NavProp = NativeStackNavigationProp<RootStackParamList, 'MyJars'>;

export default function MyJarsScreen() {
  const navigation = useNavigation<NavProp>();
  const { jarsPrimary } = useContext(ThemeContext);
  const [items] = useState(SAMPLE_ITEMS);

  const openInsights = () => {
    hapticLight();
    navigation.navigate('MyJarsInsights');
  };

  const openJournal = (item: StashItem) => {
    hapticLight();
    navigation.navigate('JournalEntry', { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: jarsPrimary }]}>My Jars</Text>
        <Pressable onPress={openInsights} hitSlop={8}>
          <BarChart color={jarsPrimary} />
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <StashItemCard item={item} onJournal={() => openJournal(item)} onReorder={() => {}} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your Stash Box is empty!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: '600' },
  list: { paddingHorizontal: 16 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#666' },
});
