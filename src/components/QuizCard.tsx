// src/components/QuizCard.tsx
// Card component displayed on article detail when a quiz is available

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import React, { useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import type { Quiz } from '../types/quiz';
import { hapticLight, hapticMedium } from '../utils/haptic';

interface QuizCardProps {
  quiz: Quiz;
  articleSlug: string;
}

type QuizNavProp = NativeStackNavigationProp<RootStackParamList, 'ArticleDetail'>;

export default function QuizCard({ quiz, articleSlug }: QuizCardProps) {
  const navigation = useNavigation<QuizNavProp>();
  const { brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const cornerRadius = 12;

  const status = useMemo(() => {
    const now = new Date();
    const endDate = quiz.endAt ? new Date(quiz.endAt) : null;
    const isExpired = endDate && endDate < now;
    const hasPassed = quiz.userStatus?.passed ?? false;
    const attempts = quiz.userStatus?.attempts ?? 0;
    const maxReached = quiz.maxAttempts ? attempts >= quiz.maxAttempts : false;

    if (hasPassed) return 'passed';
    if (isExpired) return 'expired';
    if (maxReached) return 'max_attempts';
    return 'eligible';
  }, [quiz]);

  const timeRemaining = useMemo(() => {
    if (!quiz.endAt) return null;
    const now = new Date();
    const end = new Date(quiz.endAt);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  }, [quiz.endAt]);

  const handlePress = () => {
    if (status === 'eligible') {
      hapticMedium();
      navigation.navigate('QuizScreen', { quizId: quiz.id, articleSlug });
    } else {
      hapticLight();
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'passed':
        return (
          <>
            <View style={styles.iconRow}>
              <CheckCircle color="#22C55E" size={24} />
              <Text style={[styles.title, { color: '#22C55E' }]}>Quiz Completed!</Text>
            </View>
            <Text style={[styles.subtitle, { color: brandSecondary }]}>
              You earned {quiz.userStatus?.pointsEarned ?? quiz.pointsReward} points
            </Text>
          </>
        );

      case 'expired':
        return (
          <>
            <View style={styles.iconRow}>
              <XCircle color="#9CA3AF" size={24} />
              <Text style={[styles.title, { color: '#9CA3AF' }]}>Quiz Ended</Text>
            </View>
            <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>
              This quiz is no longer available
            </Text>
          </>
        );

      case 'max_attempts':
        return (
          <>
            <View style={styles.iconRow}>
              <XCircle color="#EF4444" size={24} />
              <Text style={[styles.title, { color: '#EF4444' }]}>No Attempts Left</Text>
            </View>
            <Text style={[styles.subtitle, { color: brandSecondary }]}>
              You&apos;ve used all {quiz.maxAttempts} attempts
            </Text>
          </>
        );

      default:
        return (
          <>
            <View style={styles.iconRow}>
              <Award color={brandPrimary} size={24} />
              <Text style={[styles.title, { color: brandPrimary }]}>
                Take Quiz → Earn {quiz.pointsReward} Points
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: brandSecondary }]}>
              {quiz.questions.length} questions • {quiz.passThreshold}% to pass
            </Text>
            {timeRemaining && (
              <View style={styles.timerRow}>
                <Clock color={brandSecondary} size={14} />
                <Text style={[styles.timerText, { color: brandSecondary }]}>{timeRemaining}</Text>
              </View>
            )}
          </>
        );
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={status !== 'eligible'}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: status === 'passed' ? '#F0FDF4' : brandBackground,
          borderColor: status === 'passed' ? '#22C55E' : brandPrimary,
          borderRadius: cornerRadius,
          opacity: pressed && status === 'eligible' ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        status === 'eligible'
          ? `Take quiz to earn ${quiz.pointsReward} points`
          : status === 'passed'
            ? 'Quiz completed'
            : 'Quiz unavailable'
      }
    >
      {renderContent()}
      {status === 'eligible' && (
        <View style={[styles.ctaButton, { backgroundColor: brandPrimary }]}>
          <Text style={styles.ctaText}>Take Quiz</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  timerText: {
    fontSize: 12,
  },
  ctaButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
