// src/screens/CommunityGardenScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

const posts = [
  {
    id: '1',
    user: 'JaneDoe',
    time: '2h ago',
    text: 'Just tried the Rainbow Rozay—so uplifting! 🌈✨',
  },
  {
    id: '2',
    user: 'GreenThumb',
    time: '5h ago',
    text: 'Loving the new terpene profile guide.',
  },
  {
    id: '3',
    user: 'PeacefulPete',
    time: '1d ago',
    text: 'Who else is excited for the Educational Greenhouse updates?',
  },
];

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CommunityGardenScreen() {
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  // Animate in on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Dynamic background
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handlePostPress = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Community Garden
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {posts.map((post) => (
          <Pressable
            key={post.id}
            style={styles.postCard}
            onPress={handlePostPress}
          >
            <View style={styles.postHeader}>
              <Image
                source={{ uri: `https://placehold.co/40x40?text=${post.user[0]}` }}
                style={styles.avatar}
              />
              <View>
                <Text style={[styles.username, { color: jarsPrimary }]}>
                  {post.user}
                </Text>
                <Text style={styles.time}>{post.time}</Text>
              </View>
            </View>
            <Text style={styles.postText}>{post.text}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  username: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12, color: '#777777' },
  postText: { fontSize: 15, color: '#333333', lineHeight: 22 },
});
