// src/components/quiz/QuizCard.tsx
// Enhanced quiz preview card with animations and gamification

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

import { ThemeContext } from '../../context/ThemeContext';
import type { RootStackParamList } from '../../navigation/types';
import type { Quiz, QuizUserStatus } from '../../services/quizService';
import { hapticLight, hapticMedium } from '../../utils/haptic';

interface QuizCardProps {
  quiz: Quiz;
  userStatus: QuizUserStatus | null;
  articleSlug: string;
}

type QuizNavProp = NativeStackNavigationProp<RootStackParamList, 'ArticleDetail'>;

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, userStatus, articleSlug }) => {
  const navigation = useNavigation<QuizNavProp>();
  const { brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);

  const isLocked = userStatus?.locked;
  const hasPassed = userStatus?.passed;
  const hasAttempted = (userStatus?.attemptCount || 0) > 0;

  // Animations
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for CTA
    if (!isLocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Shimmer effect for points badge
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, slideAnim, pulseAnim, shimmerAnim, isLocked]);

  const handleStart = () => {
    if (isLocked) {
      hapticLight();
      return;
    }
    hapticMedium();
    navigation.navigate('QuizScreen', { articleSlug });
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: brandBackground,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Decorative gradient line */}
      <View style={[styles.gradientLine, { backgroundColor: brandPrimary }]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
          <Animated.View style={{ transform: [{ translateX: shimmerTranslate }] }}>
            <View style={styles.shimmer} />
          </Animated.View>
          <Ionicons name="trophy" size={18} color="#F59E0B" />
          <Text style={[styles.badgeText, { color: '#B45309' }]}>Earn {quiz.pointsReward} pts</Text>
        </View>

        {hasPassed && (
          <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.statusText}>Complete!</Text>
          </View>
        )}
      </View>

      {/* Quiz Icon */}
      <View style={styles.quizIconRow}>
        <View style={[styles.quizIcon, { backgroundColor: brandPrimary + '15' }]}>
          <Ionicons name="help-circle" size={28} color={brandPrimary} />
        </View>
        <View style={styles.titleContent}>
          <Text style={[styles.label, { color: brandSecondary }]}>KNOWLEDGE QUIZ</Text>
          <Text style={[styles.title, { color: brandPrimary }]}>{quiz.title}</Text>
        </View>
      </View>

      {/* Meta info chips */}
      <View style={styles.metaChips}>
        <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
          <Ionicons name="list" size={14} color="#6B7280" />
          <Text style={styles.chipText}>{quiz.questions.length} questions</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
          <Ionicons name="ribbon" size={14} color="#6B7280" />
          <Text style={styles.chipText}>Pass: {quiz.passThreshold}%</Text>
        </View>
        {quiz.maxAttempts && (
          <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="refresh-circle" size={14} color="#6B7280" />
            <Text style={styles.chipText}>{quiz.maxAttempts} tries</Text>
          </View>
        )}
      </View>

      {/* Previous attempt feedback */}
      {hasAttempted &&
        !hasPassed &&
        userStatus?.lastScore !== null &&
        userStatus?.lastScore !== undefined && (
          <View style={styles.attemptFeedback}>
            <Ionicons name="trending-up" size={16} color="#F59E0B" />
            <Text style={styles.attemptText}>
              Last attempt: {userStatus.lastScore.toFixed(0)}% — You're so close!
            </Text>
          </View>
        )}

      {/* Action Button */}
      <Animated.View style={{ transform: [{ scale: isLocked ? 1 : pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isLocked ? '#E5E7EB' : brandPrimary,
            },
          ]}
          onPress={handleStart}
          disabled={isLocked}
          accessibilityRole="button"
          accessibilityLabel={isLocked ? 'Points already earned' : 'Start quiz'}
          activeOpacity={0.8}
        >
          {isLocked ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.buttonText, { color: '#10B981' }]}>Points Earned!</Text>
            </>
          ) : hasAttempted ? (
            <>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Try Again</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </>
          ) : (
            <>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.buttonText}>Start Quiz</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Urgency/motivation text */}
      {!isLocked && (
        <Text style={[styles.motivationText, { color: brandSecondary }]}>
          {hasAttempted ? '💪 Practice makes perfect!' : '🎯 Test your knowledge & earn rewards!'}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  gradientLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: 50,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '20deg' }],
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  quizIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  quizIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  attemptFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  attemptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  motivationText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default QuizCard;
