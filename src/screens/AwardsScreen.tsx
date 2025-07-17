// src/screens/AwardsScreen.tsx
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AWARDS = [
  { id: 'reviewYear', label: 'Review of the Year' },
  { id: 'pairing', label: 'Best Product Pairing' },
  { id: 'gardener', label: 'Top Greenhouse Contributor' },
  { id: 'concierge', label: 'Most Helpful Concierge Interaction' },
];

export default function AwardsScreen() {
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleSelect = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: jarsPrimary }]}>
          Jars Awards
        </Text>
        <Text style={[styles.description, { color: jarsSecondary }]}>
          Celebrate our community’s top contributors—and cast your vote!
        </Text>

        {AWARDS.map((award) => (
          <TouchableOpacity
            key={award.id}
            style={[styles.card, { borderColor: jarsPrimary }]}
            onPress={handleSelect}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardText, { color: jarsPrimary }]}>
              {award.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
