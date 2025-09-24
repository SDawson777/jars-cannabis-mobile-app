import React, { useContext } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  Pressable,
  SafeAreaView,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { useAccessibilityStore } from '../state/accessibilityStore';
import { useTextScaling } from '../hooks/useTextScaling';
import { ThemeContext } from '../context/ThemeContext';

export default function AppSettingsScreen() {
  const { jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { scaleSize } = useTextScaling();
  const { textSize, setTextSize, highContrast, setHighContrast, reduceMotion, setReduceMotion } =
    useAccessibilityStore();

  const handleTextSizeCycle = () => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const sizes = ['system', 'sm', 'md', 'lg', 'xl'] as const;
    const idx = sizes.indexOf(textSize);
    setTextSize(sizes[(idx + 1) % sizes.length]);
  };

  const handleHighContrastToggle = (value: boolean) => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setHighContrast(value);
  };

  const handleReduceMotionToggle = (value: boolean) => {
    // Don't animate the toggle that disables animations
    setReduceMotion(value);
  };

  const textColor = highContrast ? '#000000' : jarsPrimary;
  const backgroundColor = highContrast ? '#FFFFFF' : jarsBackground;
  const accentColor = highContrast ? '#0000FF' : jarsSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            styles.section,
            {
              color: textColor,
              fontSize: scaleSize(18),
            },
          ]}
        >
          Accessibility
        </Text>

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontSize: scaleSize(16),
              },
            ]}
          >
            Text Size
          </Text>
          <Pressable
            style={[
              styles.textSizeButton,
              {
                backgroundColor: highContrast ? '#E0E0E0' : '#F0F0F0',
              },
            ]}
            onPress={handleTextSizeCycle}
          >
            <Text
              style={[
                styles.textSizeText,
                {
                  color: textColor,
                  fontSize: scaleSize(14),
                },
              ]}
            >
              {textSize.toUpperCase()}
            </Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontSize: scaleSize(16),
              },
            ]}
          >
            High Contrast
          </Text>
          <Switch
            value={highContrast}
            onValueChange={handleHighContrastToggle}
            trackColor={{ false: '#E0E0E0', true: accentColor }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontSize: scaleSize(16),
              },
            ]}
          >
            Reduce Motion
          </Text>
          <Switch
            value={reduceMotion}
            onValueChange={handleReduceMotionToggle}
            trackColor={{ false: '#E0E0E0', true: accentColor }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: { fontWeight: 'bold', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: { flex: 1 },
  textSizeButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  textSizeText: { fontWeight: '500' },
});
