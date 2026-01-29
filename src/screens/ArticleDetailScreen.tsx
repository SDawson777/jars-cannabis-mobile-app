// src/screens/ArticleDetailScreen.tsx
// Enhanced article detail with reading progress, estimated time, and engagement features

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Animated,
  Share,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import CMSImage from '../components/CMSImage';
import { QuizCard } from '../components/quiz';
import { ThemeContext } from '../context/ThemeContext';
import { useArticleBySlug } from '../hooks/useArticleBySlug';
import type { RootStackParamList } from '../navigation/types';
import { getQuizForArticle, Quiz, QuizUserStatus } from '../services/quizService';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ArticleNavProp = NativeStackNavigationProp<RootStackParamList, 'ArticleDetail'>;
type ArticleRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

// Helper to estimate read time
const estimateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export default function ArticleDetailScreen() {
  const navigation = useNavigation<ArticleNavProp>();
  const route = useRoute<ArticleRouteProp>();
  const { slug } = route.params;
  const { data, isLoading, isError } = useArticleBySlug(slug);

  // Quiz state - fetched using new service
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizUserStatus, setQuizUserStatus] = useState<QuizUserStatus | null>(null);
  const [quizLoading, setQuizLoading] = useState(true);

  // Reading progress
  const [readingProgress, setReadingProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);

  const readTime = useMemo(() => {
    if (!data?.body) return 0;
    return estimateReadTime(String(data.body));
  }, [data?.body]);

  const fetchQuiz = useCallback(async () => {
    try {
      setQuizLoading(true);
      const response = await getQuizForArticle(slug);
      setQuiz(response.quiz);
      setQuizUserStatus(response.userStatus);
    } catch (_error) {
      // Quiz not found or other error - that's OK
      setQuiz(null);
      setQuizUserStatus(null);
    } finally {
      setQuizLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    fetchQuiz();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fetchQuiz, fadeAnim]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: readingProgress,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [readingProgress, progressAnim]);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const handleBack = () => {
    hapticLight();
    navigation.goBack();
  };

  const handleShare = async () => {
    hapticMedium();
    try {
      await Share.share({
        message: `Check out this article: ${data?.title}`,
        title: data?.title,
      });
    } catch (_error) {
      // Share cancelled or failed
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    if (maxScroll > 0) {
      const progress = Math.min(100, (contentOffset.y / maxScroll) * 100);
      setReadingProgress(progress);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={brandPrimary} />
        <Text style={[styles.loadingText, { color: brandSecondary }]}>Loading article...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={64} color={brandSecondary} />
        <Text style={[styles.errorText, { color: brandPrimary }]}>Couldn't load article</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: brandPrimary }]}
          onPress={handleBack}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Reading progress bar */}
      <Animated.View
        style={[styles.progressBar, { width: progressWidth, backgroundColor: brandPrimary }]}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#E5E7EB' }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={brandPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.progressText, { color: brandSecondary }]}>
            {Math.round(readingProgress)}% read
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          accessibilityLabel="Share article"
        >
          <Ionicons name="share-outline" size={22} color={brandPrimary} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ opacity: fadeAnim }}
      >
        {/* Hero image */}
        {data.mainImage && (
          <View style={styles.heroContainer}>
            <CMSImage uri={data.mainImage.url} alt={data.mainImage.alt} style={styles.hero} />
            <View style={styles.heroOverlay} />
          </View>
        )}

        {/* Article meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={brandSecondary} />
            <Text style={[styles.metaText, { color: brandSecondary }]}>
              {new Date(data.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={brandSecondary} />
            <Text style={[styles.metaText, { color: brandSecondary }]}>{readTime} min read</Text>
          </View>
          {quiz && !quizUserStatus?.passed && (
            <>
              <View style={styles.metaDot} />
              <View style={[styles.quizBadge, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="trophy" size={12} color="#F59E0B" />
                <Text style={styles.quizBadgeText}>+{quiz.pointsReward} pts</Text>
              </View>
            </>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: brandPrimary }]}>{data.title}</Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: '#E5E7EB' }]} />

        {/* Article body */}
        <Text style={[styles.articleText, { color: brandSecondary }]}>{String(data.body)}</Text>

        {/* Quiz Card - shows when quiz is available */}
        {!quizLoading && quiz && (
          <View style={styles.quizSection}>
            <View style={styles.quizSectionHeader}>
              <Ionicons name="school" size={20} color={brandPrimary} />
              <Text style={[styles.quizSectionTitle, { color: brandPrimary }]}>
                Test Your Knowledge
              </Text>
            </View>
            <QuizCard quiz={quiz} userStatus={quizUserStatus} articleSlug={slug} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: brandSecondary }]}>Thanks for reading! 📚</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    padding: 6,
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  heroContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  hero: {
    width: '100%',
    height: 220,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    // Subtle gradient effect
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  quizBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  articleText: {
    fontSize: 17,
    lineHeight: 28,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  quizSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  quizSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  quizSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
