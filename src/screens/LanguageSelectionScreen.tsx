import React, { useContext } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { hapticLight } from '../utils/haptic';
import { t } from '../utils/i18n';

export default function LanguageSelectionScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { locale, setLocale } = useSettings();
  const languages = [
    { code: 'en', label: t('english') },
    { code: 'es', label: t('spanish') },
  ];

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const handleSelect = async (code: string) => {
    hapticLight();
    await setLocale(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>{t('selectLanguage')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        {languages.map(lang => (
          <Pressable
            key={lang.code}
            style={[styles.row, { borderBottomColor: jarsSecondary }]}
            onPress={() => handleSelect(lang.code)}
          >
            <Text style={[styles.label, { color: jarsPrimary }]}>{lang.label}</Text>
            {locale === lang.code && <Text style={{ color: jarsSecondary }}>✓</Text>}
          </Pressable>
        ))}
      </View>
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
});
