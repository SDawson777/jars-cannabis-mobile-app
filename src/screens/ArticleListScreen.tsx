import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { useEducationalArticles } from '../hooks/useEducationalArticles';
import type { RootStackParamList } from '../navigation/types';
import type { CMSArticle } from '../types/cms';
import { hapticLight } from '../utils/haptic';
import { trackScreenView, trackContentClick } from '../utils/analytics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ArticleList'>;

export default function ArticleListScreen() {
  const navigation = useNavigation<NavProp>();
  const { colorTemp, brandPrimary, brandBackground } = useContext(ThemeContext);
  const { data, isLoading } = useEducationalArticles();

  // Track screen view
  useFocusEffect(
    useCallback(() => {
      trackScreenView('ArticleListScreen');
    }, [])
  );

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const articles = data ?? [];

  const openArticle = (article: CMSArticle) => {
    hapticLight();
    trackContentClick('article', article.slug || article.__id, { title: article.title });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('ArticleDetail', { slug: article.slug });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList<CMSArticle>
        data={articles}
        keyExtractor={item => item.__id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openArticle(item)}>
            <Text style={[styles.title, { color: brandPrimary }]}>{item.title}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16 },
});
