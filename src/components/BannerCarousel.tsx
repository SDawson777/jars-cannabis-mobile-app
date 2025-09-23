import React, { useRef, useEffect } from 'react';
import { ScrollView, Text, Pressable, StyleSheet, Dimensions } from 'react-native';

import { CMSBanner } from '../types/cms';
import { hapticLight } from '../utils/haptic';

import CMSImage from './CMSImage';

interface Props {
  banners: CMSBanner[];
  onPress?: (__banner: CMSBanner) => void;
}

export default function BannerCarousel({ banners, onPress }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current || banners.length === 0) return;
      scrollRef.current.scrollTo({
        x: (Dimensions.get('window').width - 32) * ((Date.now() / 4000) % banners.length),
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      contentContainerStyle={styles.container}
    >
      {banners.map(b => (
        <Pressable
          key={b.__id}
          onPress={() => {
            hapticLight();
            onPress?.(b);
          }}
          style={styles.card}
        >
          <CMSImage uri={b.image.url} alt={b.image.alt} style={styles.image} />
          {b.cta ? <Text style={styles.cta}>{b.cta}</Text> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  card: { marginRight: 16 },
  image: { width: Dimensions.get('window').width - 32, height: 160, borderRadius: 8 },
  cta: { position: 'absolute', bottom: 8, left: 8, color: '#fff', fontWeight: '600' },
});
