// src/screens/QuizScreen.tsx
// Full quiz-taking experience with Zustand state management
// Integrates with backend API endpoints for quiz submission

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { QuizQuestion } from '../components/quiz/QuizQuestion';
import { QuizResults } from '../components/quiz/QuizResults';
import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { useQuizStore } from '../store/quizStore';
import { hapticMedium, hapticError, hapticSuccess } from '../utils/haptic';

type QuizNavProp = NativeStackNavigationProp<RootStackParamList, 'QuizScreen'>;
type QuizRouteProp = RouteProp<RootStackParamList, 'QuizScreen'>;

export default function QuizScreen() {
  const navigation = useNavigation<QuizNavProp>();
  const route = useRoute<QuizRouteProp>();
  const { articleSlug } = route.params;

  const { brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);

  const {
    currentQuiz,
    answers,
    currentQuestionIndex,
    isSubmitting,
    isLoading,
    result,
    loadQuizForArticle,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    clearQuiz,
  } = useQuizStore();

  useEffect(() => {
    loadQuizForArticle(articleSlug);

    return () => {
      clearQuiz();
    };
  }, [articleSlug, loadQuizForArticle, clearQuiz]);

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    try {
      await submitQuiz();
      if (useQuizStore.getState().result?.passed) {
        hapticSuccess();
      } else {
        hapticError();
      }
    } catch (error: unknown) {
      hapticError();
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 409) {
        Alert.alert('Already Completed', 'You have already earned points for this quiz.');
      } else {
        Alert.alert('Error', 'Failed to submit quiz. Please try again.');
      }
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    hapticMedium();
    resetQuiz();
  };

  const handleViewWallet = () => {
    hapticMedium();
    navigation.navigate('Awards' as keyof RootStackParamList);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: brandBackground }]}>
        <ActivityIndicator size="large" color={brandPrimary} />
        <Text style={[styles.loadingText, { color: brandSecondary }]}>Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  // Error state - no quiz found or no questions
  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: brandBackground }]}>
        <Ionicons name="help-circle-outline" size={64} color={brandSecondary} />
        <Text style={[styles.errorText, { color: brandPrimary }]}>Quiz not found</Text>
        <Text style={[styles.errorSubtext, { color: brandSecondary }]}>
          No quiz is available for this article.
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.backButton, { borderColor: brandPrimary }]}
        >
          <Text style={[styles.backButtonText, { color: brandPrimary }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Show results if quiz completed
  if (result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: brandBackground }}>
        <QuizResults
          result={result}
          passThreshold={currentQuiz.passThreshold}
          onRetry={handleRetry}
          onClose={handleClose}
          onViewWallet={handleViewWallet}
        />
      </SafeAreaView>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
  const allAnswered = !answers.includes(null);
  const currentAnswerSelected = answers[currentQuestionIndex] !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brandBackground }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#E5E7EB' }]}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityLabel="Close quiz"
        >
          <Ionicons name="close" size={24} color={brandPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: brandPrimary }]} numberOfLines={1}>
          {currentQuiz.title}
        </Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy" size={14} color={brandPrimary} />
          <Text style={[styles.pointsText, { color: brandPrimary }]}>
            {currentQuiz.pointsReward} pts
          </Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentQuiz.questions.length}
          selectedAnswer={answers[currentQuestionIndex]}
          onSelectAnswer={optionIndex => setAnswer(currentQuestionIndex, optionIndex)}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { borderColor: '#E5E7EB' },
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={() => {
            hapticMedium();
            prevQuestion();
          }}
          disabled={currentQuestionIndex === 0}
          accessibilityLabel="Previous question"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentQuestionIndex === 0 ? '#9CA3AF' : brandPrimary}
          />
          <Text
            style={{
              color: currentQuestionIndex === 0 ? '#9CA3AF' : brandPrimary,
              fontWeight: '600',
            }}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: allAnswered ? brandPrimary : '#9CA3AF' },
            ]}
            onPress={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            accessibilityLabel="Submit quiz"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              {
                backgroundColor: currentAnswerSelected ? brandPrimary : '#9CA3AF',
              },
            ]}
            onPress={() => {
              hapticMedium();
              nextQuestion();
            }}
            disabled={!currentAnswerSelected}
            accessibilityLabel="Next question"
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Question dots */}
      <View style={styles.dots}>
        {currentQuiz.questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToQuestion(index)}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentQuestionIndex
                    ? brandPrimary
                    : answers[index] !== null
                      ? '#10B981'
                      : '#E5E7EB',
              },
            ]}
            accessibilityLabel={`Go to question ${index + 1}`}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButton: {
    borderWidth: 0,
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
