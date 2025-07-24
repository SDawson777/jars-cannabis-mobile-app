import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { BookOpen, ShoppingCart } from 'lucide-react-native';
import { hapticLight } from '../utils/haptic';
import type { StashItem } from '../@types/jars';

interface Props {
  item: StashItem;
  onJournal(): void;
  onReorder(): void;
}

export default function StashItemCard({ item, onJournal, onReorder }: Props) {
  const handleJournal = () => {
    hapticLight();
    onJournal();
  };
  const handleReorder = () => {
    hapticLight();
    onReorder();
  };

  return (
    <View style={styles.card}>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.strainType}</Text>
        <Text style={styles.meta}>{item.purchaseDate}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={handleJournal}>
          <BookOpen size={16} color="#2E5D46" />
          <Text style={styles.btnText}>Journal</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={handleReorder}>
          <ShoppingCart size={16} color="#2E5D46" />
          <Text style={styles.btnText}>Reorder</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: 72, height: 72, borderRadius: 12, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, color: '#666' },
  actions: { marginLeft: 8, alignItems: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  btnText: { marginLeft: 4, color: '#2E5D46', fontSize: 13 },
});
