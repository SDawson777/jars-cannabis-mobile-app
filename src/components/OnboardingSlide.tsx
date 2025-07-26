import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  headline: string;
  benefitText: string;
  isActive: boolean;
}

export default function OnboardingSlide({ headline, benefitText }: Props) {
  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={headline}>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.text}>{benefitText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  headline: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  text: { fontSize: 16, textAlign: 'center' },
});
