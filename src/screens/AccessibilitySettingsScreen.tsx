// src/screens/AccessibilitySettingsScreen.tsx
import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccessibilityNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AccessibilitySettings'
>;

export default function AccessibilitySettingsScreen() {
  const navigation = useNavigation<AccessibilityNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const onToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(value);
    hapticLight();
  };

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Accessibility Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: jarsSecondary }]}>
          Tailor the app’s look & feel for your comfort.
        </Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: jarsPrimary }]}>
            Reduced Motion & Sensory Mode
          </Text>
          <Switch
            value={reducedMotion}
            onValueChange={val => onToggle(setReducedMotion, val)}
            trackColor={{ true: jarsPrimary, false: '#ccc' }}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: jarsPrimary }]}>
            High Contrast
          </Text>
          <Switch
            value={highContrast}
            onValueChange={val => onToggle(setHighContrast, val)}
            trackColor={{ true: jarsPrimary, false: '#ccc' }}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: jarsPrimary }]}>
            Dyslexia-Friendly Font
          </Text>
          <Switch
            value={dyslexiaFont}
            onValueChange={val => onToggle(setDyslexiaFont, val)}
            trackColor={{ true: jarsPrimary, false: '#ccc' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 20 },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
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
  },
});
