// src/components/quiz/QuizResults.tsx
// Results screen with celebration animations and gamification

import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

import { ThemeContext } from '../../context/ThemeContext';
import type { QuizSubmitResult } from '../../services/quizService';
import { hapticSuccess, hapticError, hapticHeavy } from '../../utils/haptic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DFE6E9',
  '#74B9FF',
];

interface Props {
  result: QuizSubmitResult;
  passThreshold: number;
  onRetry: () => void;
  onClose: () => void;
  onViewWallet: () => void;
}

// Confetti piece component
const ConfettiPiece: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const initialX = useRef(Math.random() * SCREEN_WIDTH).current;
  const translateX = useRef(new Animated.Value(initialX)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT + 50,
        duration: 3000 + Math.random() * 2000,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: initialX + (Math.random() - 0.5) * 100,
        duration: 3000 + Math.random() * 2000,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 3000,
        delay: delay + 2000,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
  }, [translateY, translateX, rotate, opacity, delay]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

export const QuizResults: React.FC<Props> = ({
  result,
  passThreshold,
  onRetry,
  onClose,
  onViewWallet,
}) => {
  const { brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const passed = result.passed;
  const [showConfetti, setShowConfetti] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const pointsBounce = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const scoreCount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger haptic feedback
    if (passed) {
      hapticHeavy();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      hapticError();
    }

    // Sequence animations
    Animated.sequence([
      // Icon bounce in
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      // Score scale in
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Score counting animation
    Animated.timing(scoreCount, {
      toValue: result.score,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Points bounce
    if (passed && result.pointsAwarded > 0) {
      Animated.sequence([
        Animated.delay(800),
        Animated.spring(pointsBounce, {
          toValue: 1,
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Buttons fade in
    Animated.timing(buttonFade, {
      toValue: 1,
      duration: 500,
      delay: 1200,
      useNativeDriver: true,
    }).start();
  }, [
    passed,
    scaleAnim,
    iconScale,
    pointsBounce,
    buttonFade,
    scoreCount,
    result.score,
    result.pointsAwarded,
  ]);

  const _displayScore = scoreCount.interpolate({
    inputRange: [0, 100],
    outputRange: ['0', '100'],
  });

  return (
    <View style={[styles.container, { backgroundColor: brandBackground }]}>
      {/* Confetti overlay */}
      {showConfetti && passed && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={i * 50}
              color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            />
          ))}
        </View>
      )}

      {/* Success/Fail Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
        {passed ? (
          <View style={[styles.successIcon, { backgroundColor: '#10B98120' }]}>
            <View style={[styles.innerGlow, { backgroundColor: '#10B98110' }]}>
              <Ionicons name="checkmark-circle" size={90} color="#10B981" />
            </View>
          </View>
        ) : (
          <View style={[styles.failIcon, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="close-circle" size={80} color="#EF4444" />
          </View>
        )}
      </Animated.View>

      {/* Title with emoji */}
      <Text style={[styles.title, { color: passed ? '#10B981' : '#EF4444' }]}>
        {passed ? '🎉 Amazing!' : '😅 Almost there!'}
      </Text>
      <Text style={[styles.subtitle, { color: brandSecondary }]}>
        {passed ? 'You nailed it!' : 'Give it another shot'}
      </Text>

      {/* Animated Score */}
      <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.scoreCircle, { borderColor: passed ? '#10B981' : '#EF4444' }]}>
          <Animated.Text style={[styles.score, { color: brandPrimary }]}>
            {scoreCount.interpolate({
              inputRange: [0, 100],
              outputRange: ['0', String(Math.round(result.score))],
            })}
          </Animated.Text>
          <Text style={[styles.scorePercent, { color: brandPrimary }]}>%</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: brandSecondary }]}>
          {result.correctCount} of {result.totalQuestions} correct
        </Text>
        <View style={styles.thresholdBadge}>
          <Text style={[styles.threshold, { color: brandSecondary }]}>
            Pass threshold: {passThreshold}%
          </Text>
        </View>
      </Animated.View>

      {/* Points Earned - Animated */}
      {passed && result.pointsAwarded > 0 && (
        <Animated.View
          style={[
            styles.pointsCard,
            {
              backgroundColor: '#FEF3C7',
              borderColor: '#F59E0B40',
              transform: [
                { scale: pointsBounce },
                {
                  rotate: pointsBounce.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['0deg', '-3deg', '0deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.pointsIconWrapper}>
            <Ionicons name="star" size={36} color="#F59E0B" />
          </View>
          <View style={styles.pointsContent}>
            <Text style={styles.pointsValue}>+{result.pointsAwarded}</Text>
            <Text style={styles.pointsLabel}>Loyalty Points Added!</Text>
          </View>
          <View style={styles.sparkle}>
            <Text style={styles.sparkleText}>✨</Text>
          </View>
        </Animated.View>
      )}

      {/* Message */}
      <Text style={[styles.message, { color: brandSecondary }]}>{result.message}</Text>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: buttonFade }]}>
        {passed ? (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: brandPrimary }]}
              onPress={() => {
                hapticSuccess();
                onViewWallet();
              }}
              accessibilityRole="button"
              accessibilityLabel="View wallet"
            >
              <Ionicons name="wallet" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>View My Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: brandPrimary }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Back to article"
            >
              <Text style={[styles.secondaryButtonText, { color: brandPrimary }]}>
                Back to Article
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {!result.locked && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: brandPrimary }]}
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#E5E7EB' }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Back to article"
            >
              <Text style={[styles.secondaryButtonText, { color: brandPrimary }]}>
                Back to Article
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      {/* Remaining attempts */}
      {!passed && result.remainingAttempts !== null && result.remainingAttempts !== undefined && (
        <View style={styles.attemptsContainer}>
          <Ionicons name="refresh-circle" size={18} color="#F59E0B" />
          <Text style={[styles.attempts, { color: '#F59E0B' }]}>
            {result.remainingAttempts} {result.remainingAttempts === 1 ? 'attempt' : 'attempts'}{' '}
            remaining
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    marginBottom: 12,
    paddingBottom: 30,
  },
  score: {
    fontSize: 52,
    fontWeight: '800',
  },
  scorePercent: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  thresholdBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  threshold: {
    fontSize: 13,
    fontWeight: '500',
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
    gap: 14,
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsContent: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#B45309',
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -4,
  },
  sparkleText: {
    fontSize: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
  },
  attempts: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuizResults;
