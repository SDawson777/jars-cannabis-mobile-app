// src/screens/AppSettingsScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext';
import { t } from '../utils/i18n';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const [darkMode, setDarkMode] = useState(false);
  const [visitAlerts, setVisitAlerts] = useState(false);
  const [personalOffers, setPersonalOffers] = useState(false);
  const { biometricEnabled, setBiometricEnabled, locale } = useSettings();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    AsyncStorage.getItem('visitAlerts').then(v => setVisitAlerts(v === 'true'));
    AsyncStorage.getItem('personalOffers').then(v => setPersonalOffers(v === 'true'));
  }, []);

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const toggleDarkMode = (val: boolean) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDarkMode(val);
  };

  const toggleVisitAlerts = (val: boolean) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisitAlerts(val);
    AsyncStorage.setItem('visitAlerts', String(val));
  };

  const togglePersonalOffers = (val: boolean) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPersonalOffers(val);
    AsyncStorage.setItem('personalOffers', String(val));
  };

  const toggleBiometric = (val: boolean) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBiometricEnabled(val);
  };

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>App Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dark Mode */}
        <View style={[styles.row, { borderBottomColor: jarsSecondary }]}>
          <Text style={[styles.label, { color: jarsPrimary }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#EEEEEE', true: jarsSecondary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Store Visit Alerts */}
        <View style={[styles.row, { borderBottomColor: jarsSecondary }]}>
          <Text style={[styles.label, { color: jarsPrimary }]}>Enable Store Visit Alerts</Text>
          <Switch
            value={visitAlerts}
            onValueChange={toggleVisitAlerts}
            trackColor={{ false: '#EEEEEE', true: jarsSecondary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Personalized Offers */}
        <View style={[styles.row, { borderBottomColor: jarsSecondary }]}>
          <Text style={[styles.label, { color: jarsPrimary }]}>Enable Personalized Offers</Text>
          <Switch
            value={personalOffers}
            onValueChange={togglePersonalOffers}
            trackColor={{ false: '#EEEEEE', true: jarsSecondary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={[styles.section, { color: jarsSecondary }]}>Privacy &amp; Security</Text>
        <View style={[styles.row, { borderBottomColor: jarsSecondary }]}>
          <Text style={[styles.label, { color: jarsPrimary }]}>Enable Face ID / Touch ID</Text>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometric}
            trackColor={{ false: '#EEEEEE', true: jarsSecondary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Language */}
        <Pressable
          style={[styles.row, { borderBottomColor: jarsSecondary }]}
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.navigate('LanguageSelection');
          }}
        >
          <Text style={[styles.label, { color: jarsPrimary }]}>{t('language')}</Text>
          <Text style={[styles.value, { color: jarsSecondary }]}>
            {locale === 'es' ? t('spanish') : t('english')}
          </Text>
        </Pressable>

        {/* About App */}
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View>
            <Text style={[styles.label, { color: jarsPrimary }]}>About App</Text>
            <Text style={[styles.subLabel, { color: jarsSecondary }]}>Version 1.0.0 (Build 1)</Text>
          </View>
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
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
  value: { fontSize: 16 },
  subLabel: { fontSize: 14, marginTop: 4 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 24, marginBottom: 8 },
});
