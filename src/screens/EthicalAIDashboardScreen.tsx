import React, { useContext } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useDataCategories } from '../api/hooks/useDataCategories';
import { usePrivacyPreferences } from '../api/hooks/usePrivacyPreferences';
import DataCategoryItem from '../components/DataCategoryItem';
import { hapticLight } from '../utils/haptic';

export default function EthicalAIDashboardScreen() {
  const navigation = useNavigation();
  const { jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const { data } = useDataCategories();
  const { data: prefs, updatePreferences } = usePrivacyPreferences();

  const bgColor = jarsBackground;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: jarsPrimary }]}>Ethical AI Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {prefs && (
        <Pressable
          onPress={() => updatePreferences({ highContrast: !prefs.highContrast })}
          accessibilityRole="button"
          accessibilityLabel="Toggle high contrast mode"
          style={styles.toggle}
        >
          <Text style={{ color: jarsPrimary }}>
            High Contrast: {prefs.highContrast ? 'On' : 'Off'}
          </Text>
        </Pressable>
      )}

      <FlatList
        data={data || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DataCategoryItem category={item} />}
        contentContainerStyle={styles.list}
      />
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
  title: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16 },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
