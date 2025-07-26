import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { CMSArticle } from '../types/cms';
import { hapticLight } from '../utils/haptic';

interface Props {
  article: CMSArticle;
  onPress: () => void;
}

export default function ArticlePreviewCard({ article, onPress }: Props) {
  const snippet = String(article.body).slice(0, 80);
  return (
    <Pressable style={styles.card} onPress={() => { hapticLight(); onPress(); }}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.snippet}>{snippet}...</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  snippet: { color: '#555' },
});
