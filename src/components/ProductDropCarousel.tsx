import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';

import { CMSDrop } from '../types/cms';
import { hapticLight } from '../utils/haptic';

import CMSImage from './CMSImage';

interface Props {
  drops: CMSDrop[];
  onPress?: (__drop: CMSDrop) => void;
}

export default function ProductDropCarousel({ drops, onPress }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current || drops.length === 0) return;
      scrollRef.current.scrollTo({
        x: (Dimensions.get('window').width - 32) * ((Date.now() / 4000) % drops.length),
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [drops]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      contentContainerStyle={styles.container}
    >
      {drops.map(d => (
        <Pressable
          key={d.__id}
          onPress={() => {
            hapticLight();
            onPress?.(d);
          }}
          style={styles.card}
        >
          <CMSImage uri={d.image.url} alt={d.image.alt} style={styles.image} />
          <View style={styles.meta}>
            <Text style={styles.title}>{d.title}</Text>
            {d.highlight ? <Text style={styles.highlight}>{d.highlight}</Text> : null}
            <Text style={styles.count}>{d.items} items</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  card: { marginRight: 16 },
  image: { width: Dimensions.get('window').width - 32, height: 160, borderRadius: 8 },
  meta: { position: 'absolute', bottom: 8, left: 8 },
  title: { color: '#fff', fontWeight: '600' },
  highlight: { color: '#fff' },
  count: { color: '#fff', fontSize: 12 },
});
