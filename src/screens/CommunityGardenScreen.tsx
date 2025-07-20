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
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CommunityNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CommunityGarden'
>;

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

export default function CommunityGardenScreen() {
  const navigation = useNavigation<CommunityNavProp>();
  const {
    colorTemp,
    jarsPrimary,
    jarsSecondary,
    jarsBackground,
  } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handlePostPress = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Community Garden
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {posts.map(post => (
          <Pressable
            key={post.id}
            style={[styles.postCard, { backgroundColor: jarsBackground }]}
            onPress={handlePostPress}
            android_ripple={{ color: `${jarsSecondary}20` }}
          >
            <View style={styles.postHeader}>
              <Image
                source={{
                  uri: `https://placehold.co/40x40?text=${post.user[0]}`,
                }}
                style={styles.avatar}
              />
              <View>
                <Text
                  style={[styles.username, { color: jarsPrimary }]}
                >
                  {post.user}
                </Text>
                <Text style={[styles.time, { color: jarsSecondary }]}>
                  {post.time}
                </Text>
              </View>
            </View>
            <Text style={[styles.postText, { color: jarsPrimary }]}>
              {post.text}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12, marginTop: 2 },
  postText: { fontSize: 15, lineHeight: 22 },
});
