// src/screens/AccessibilitySettingsScreen.tsx
import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AccessibilitySettingsScreen() {
  const { colorTemp, jarsPrimary } = useContext(ThemeContext);

  // Map our colorTemperature to background shades
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' :
    colorTemp === 'cool' ? '#F7F9FA' :
                          '#F9F9F9';

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  // Animate the entire view on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Helper to animate + haptic + state
  const onToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(value);
    hapticLight();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: jarsPrimary }]}>
          Accessibility Settings
        </Text>
        <Text style={styles.description}>
          Tailor the app’s look & feel for your comfort.
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Reduced Motion & Sensory Mode</Text>
          <Switch
            value={reducedMotion}
            onValueChange={val => onToggle(setReducedMotion, val)}
            trackColor={{ true: jarsPrimary }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>High Contrast</Text>
          <Switch
            value={highContrast}
            onValueChange={val => onToggle(setHighContrast, val)}
            trackColor={{ true: jarsPrimary }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Dyslexia-Friendly Font</Text>
          <Switch
            value={dyslexiaFont}
            onValueChange={val => onToggle(setDyslexiaFont, val)}
            trackColor={{ true: jarsPrimary }}
          />
        </View>
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
    color: '#777777',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 16,
    color: '#333333',
  },
});
