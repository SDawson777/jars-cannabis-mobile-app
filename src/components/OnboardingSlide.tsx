import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import AnimatedPulseGlow from './AnimatedPulseGlow';

interface Props {
  headline: string;
  benefitText: string;
  illustration?: any;
  isActive: boolean;
}

export default function OnboardingSlide({ headline, benefitText, illustration }: Props) {
  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={headline}>
      {illustration && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.illustrationWrap}>
          <AnimatedPulseGlow />
          <Image source={illustration} style={styles.illustration} />
        </Animated.View>
      )}
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.text}>{benefitText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  headline: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  text: { fontSize: 16, textAlign: 'center' },
  illustrationWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  illustration: { width: 120, height: 120, resizeMode: 'contain', position: 'absolute' },
});
