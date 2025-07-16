// src/screens/DataTransparencyScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
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
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DataTransparencyScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [useJournal, setUseJournal] = useState(true);
  const [useLocation, setUseLocation] = useState(true);
  const [useBrowsing, setUseBrowsing] = useState(true);

  // animate in on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const onToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(val);
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
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Data & Personalization
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Control how Jars uses your data to personalize your experience.
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Use journal entries</Text>
          <Switch
            value={useJournal}
            onValueChange={(v) => onToggle(setUseJournal, v)}
            trackColor={{ true: jarsPrimary, false: '#EEEEEE' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Use location for alerts</Text>
          <Switch
            value={useLocation}
            onValueChange={(v) => onToggle(setUseLocation, v)}
            trackColor={{ true: jarsPrimary, false: '#EEEEEE' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Track browsing history</Text>
          <Switch
            value={useBrowsing}
            onValueChange={(v) => onToggle(setUseBrowsing, v)}
            trackColor={{ true: jarsPrimary, false: '#EEEEEE' }}
            thumbColor="#FFFFFF"
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
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  intro: { fontSize: 16, marginBottom: 24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: { fontSize: 16 },
});
