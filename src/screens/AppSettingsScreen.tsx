import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [darkMode, setDarkMode] = useState(false);

  // animate on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const toggleDark = (val: boolean) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDarkMode(val);
  };

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color="#333333" size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          App Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dark Mode */}
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            trackColor={{ false: '#EEEEEE', true: jarsSecondary }}
            thumbColor="#FFFFFF"
            value={darkMode}
            onValueChange={toggleDark}
          />
        </View>

        {/* Language */}
        <Pressable
          style={styles.row}
          onPress={() => {
            hapticLight();
            Alert.alert('Language', 'Language picker coming soon.');
          }}
        >
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>English</Text>
        </Pressable>

        {/* About */}
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View>
            <Text style={styles.label}>About App</Text>
            <Text style={styles.subLabel}>Version 1.0.0 (Build 1)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: { fontSize: 16, color: '#333333' },
  value: { fontSize: 16, color: '#777777' },
  subLabel: { fontSize: 14, color: '#777777', marginTop: 4 },
});
