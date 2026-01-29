// src/components/quiz/QuizQuestion.tsx
// Individual quiz question with enhanced animations and gamification

import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

import { ThemeContext } from '../../context/ThemeContext';
import type { QuizQuestion as QuizQuestionType } from '../../services/quizService';
import { hapticMedium } from '../../utils/haptic';

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (optionIndex: number) => void;
  showExplanation?: boolean;
  correctAnswer?: number;
}

export const QuizQuestion: React.FC<Props> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showExplanation = false,
  correctAnswer,
}) => {
  const { brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(question.options.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset and animate in
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    progressAnim.setValue(0);
    optionAnims.forEach(anim => anim.setValue(0));

    // Question fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: (questionNumber / totalQuestions) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Staggered option animation
    Animated.stagger(
      80,
      optionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [questionNumber, fadeAnim, slideAnim, progressAnim, optionAnims, totalQuestions]);

  const getOptionStyle = (index: number) => {
    if (!showExplanation) {
      // During quiz - highlight selected with subtle animation
      return selectedAnswer === index
        ? { backgroundColor: brandPrimary, borderColor: brandPrimary }
        : { backgroundColor: brandBackground, borderColor: '#E5E7EB' };
    }

    // After submission - show correct/incorrect
    if (index === correctAnswer) {
      return { backgroundColor: '#10B98125', borderColor: '#10B981' };
    }
    if (index === selectedAnswer && index !== correctAnswer) {
      return { backgroundColor: '#EF444425', borderColor: '#EF4444' };
    }
    return { backgroundColor: brandBackground, borderColor: '#E5E7EB' };
  };

  const getOptionTextColor = (index: number) => {
    if (!showExplanation && selectedAnswer === index) {
      return '#fff';
    }
    return brandPrimary;
  };

  const handleSelect = (index: number) => {
    if (!showExplanation) {
      hapticMedium();
      onSelectAnswer(index);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Progress header with step indicator */}
      <View style={styles.progressHeader}>
        <View style={styles.stepIndicator}>
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    idx < questionNumber
                      ? brandPrimary
                      : idx === questionNumber - 1
                        ? brandPrimary
                        : '#E5E7EB',
                  transform: [{ scale: idx === questionNumber - 1 ? 1.3 : 1 }],
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.progress, { color: brandSecondary }]}>
          {questionNumber}/{totalQuestions}
        </Text>
      </View>

      {/* Animated progress bar */}
      <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: brandPrimary,
              width: progressWidth,
            },
          ]}
        />
      </View>

      {/* Encouragement text */}
      <View style={styles.encouragement}>
        <Text style={[styles.encouragementText, { color: brandSecondary }]}>
          {questionNumber === 1 && "🚀 Let's go!"}
          {questionNumber === Math.ceil(totalQuestions / 2) && '💪 Halfway there!'}
          {questionNumber === totalQuestions && '🏁 Last question!'}
          {questionNumber !== 1 &&
            questionNumber !== Math.ceil(totalQuestions / 2) &&
            questionNumber !== totalQuestions &&
            '🧠 Keep it up!'}
        </Text>
      </View>

      {/* Question text */}
      <Text style={[styles.prompt, { color: brandPrimary }]}>{question.prompt}</Text>

      {/* Options with staggered animations */}
      <View style={styles.options}>
        {question.options.map((option, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: optionAnims[index],
              transform: [
                {
                  translateX: optionAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
                {
                  scale: optionAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => handleSelect(index)}
              disabled={showExplanation}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedAnswer === index }}
              accessibilityLabel={`Option ${String.fromCharCode(65 + index)}: ${option}`}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionLetter,
                    selectedAnswer === index &&
                      !showExplanation && {
                        backgroundColor: '#fff',
                        transform: [{ scale: 1.1 }],
                      },
                    showExplanation &&
                      index === correctAnswer && {
                        backgroundColor: '#10B981',
                      },
                    showExplanation &&
                      index === selectedAnswer &&
                      index !== correctAnswer && {
                        backgroundColor: '#EF4444',
                      },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      selectedAnswer === index && !showExplanation && { color: brandPrimary },
                      showExplanation &&
                        (index === correctAnswer || index === selectedAnswer) && { color: '#fff' },
                    ]}
                  >
                    {showExplanation && index === correctAnswer
                      ? '✓'
                      : showExplanation && index === selectedAnswer && index !== correctAnswer
                        ? '✗'
                        : String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: getOptionTextColor(index) }]}>
                  {option}
                </Text>
              </View>

              {/* Selection indicator */}
              {selectedAnswer === index && !showExplanation && (
                <View style={styles.selectedCheck}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Explanation (shown after submission) */}
      {showExplanation && question.explanation && (
        <Animated.View
          style={[
            styles.explanation,
            { backgroundColor: '#3B82F615', borderColor: '#3B82F640', borderWidth: 1 },
          ]}
        >
          <Text style={[styles.explanationTitle, { color: '#3B82F6' }]}>💡 Did you know?</Text>
          <Text style={[styles.explanationText, { color: brandPrimary }]}>
            {question.explanation}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progress: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  encouragement: {
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  prompt: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 28,
  },
  options: {
    gap: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  correctIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  incorrectIcon: {
    fontSize: 20,
    color: '#EF4444',
  },
  explanation: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
  },
});

export default QuizQuestion;
