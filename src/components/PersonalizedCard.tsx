import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import MiniProductCard from './MiniProductCard';
import AnimatedPulseGlow from './AnimatedPulseGlow';
import ContextualIcon from './ContextualIcon';
import PoweredByAIBadge from './PoweredByAIBadge';
import CustomAudioPlayer from '../audio/CustomAudioPlayer';
import { usePersonalizedCard } from '../hooks/usePersonalizedCard';
import { useOfflinePersonalizedFallback } from '../hooks/useOfflinePersonalizedFallback';
import { trackEvent } from '../utils/analytics';
import { hapticMedium, hapticLight } from '../utils/haptic';
import { fadeInUp } from '../utils/animations';
import type { PersonalizedCardData } from '../types/personalization';

export default function PersonalizedCard() {
  const { data } = usePersonalizedCard();
  const offline = useOfflinePersonalizedFallback();
  const card: PersonalizedCardData | undefined = data || offline;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (card) {
      fadeInUp(opacity, translateY);
      trackEvent('impression_for_you_card', { scenario: card.type });
    }
  }, [card]);

  if (!card) {
    return (
      <View style={styles.fallback} testID="forYouCard_fallback">
        <Text style={styles.fallbackText}>Welcome to Jars! Discover top-rated products.</Text>
      </View>
    );
  }

  const handleCTA = () => {
    hapticLight();
    trackEvent('click_cta', { id: card.id });
  };

  const handleProduct = (pid: string, idx: number) => {
    hapticMedium();
    trackEvent('tap_product', { id: pid, index: idx });
  };

  const glowColor =
    card.type === 'product_carousel'
      ? card.effectTint === 'relaxing'
        ? '#4F91FF'
        : card.effectTint === 'uplifting'
          ? '#FFD857'
          : '#8CD24C'
      : '#8CD24C';

  return (
    <Animated.View
      style={[styles.card, animStyle]}
      testID="forYouCard"
      accessibilityLabel="For you today"
    >
      {card.type === 'product_carousel' && <AnimatedPulseGlow color={glowColor} />}
      <PoweredByAIBadge />
      <CustomAudioPlayer source={require('../../assets/audio/whisper-soft.mp3')} />
      <Text style={styles.title}>{card.title}</Text>
      {card.message && <Text style={styles.message}>{card.message}</Text>}
      {card.type === 'product_carousel' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {card.products.map((p, idx) => (
            <MiniProductCard
              key={p.id}
              item={p}
              onPress={() => handleProduct(p.id, idx)}
              testID={`forYouCard_product_${idx}` as any}
            />
          ))}
        </ScrollView>
      )}
      {card.type === 'message_only' && card.icon && <ContextualIcon name={card.icon} size={32} />}
      {'ctaText' in card && card.ctaText && (
        <Pressable onPress={handleCTA} style={styles.cta} testID="forYouCard_cta">
          <Text style={styles.ctaText}>{card.ctaText}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  fallback: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  fallbackText: { fontSize: 16, color: '#333' },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  message: { fontSize: 16, color: '#333', marginTop: 4 },
  row: { marginTop: 12 },
  cta: { marginTop: 12, alignSelf: 'flex-start' },
  ctaText: { color: '#2E5D46', fontSize: 14, fontWeight: '500' },
});
