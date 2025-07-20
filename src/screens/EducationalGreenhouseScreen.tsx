// src/screens/EducationalGreenhouseScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
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

type EduNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EducationalGreenhouse'
>;

export default function EducationalGreenhouseScreen() {
  const navigation = useNavigation<EduNavProp>();
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

  const ARTICLES = [
    { id: '1', title: 'Understanding Terpenes' },
    { id: '2', title: 'Cannabis & Wellness' },
    { id: '3', title: 'Growing at Home' },
  ];

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const openArticle = (title: string) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ArticleDetail', { title });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Greenhouse
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={ARTICLES}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: jarsSecondary }]}
            onPress={() => openArticle(item.title)}
            android_ripple={{ color: `${jarsSecondary}20` }}
          >
            <Text style={[styles.title, { color: jarsPrimary }]}>
              {item.title}
            </Text>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
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
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16 },
});
