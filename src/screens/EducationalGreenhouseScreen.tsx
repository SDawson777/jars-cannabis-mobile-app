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
import { ChevronRight } from 'lucide-react-native';
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

type EduNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EducationalGreenhouse'
>;

const ARTICLES = [
  { id: '1', title: 'Understanding Terpenes' },
  { id: '2', title: 'Cannabis & Wellness' },
  { id: '3', title: 'Growing at Home' },
];

export default function EducationalGreenhouseScreen() {
  const navigation = useNavigation<EduNavProp>();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const openArticle = (title: string) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ArticleDetail', { title });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={ARTICLES}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openArticle(item.title)}>
            <Text style={[styles.title, { color: jarsPrimary }]}>{item.title}</Text>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: { fontSize: 16 },
});
