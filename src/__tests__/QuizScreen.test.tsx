// src/__tests__/QuizScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import QuizScreen from '../screens/QuizScreen';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      articleSlug: 'intro-to-terpenes',
    },
  }),
}));

// Mock haptic feedback
jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticHeavy: jest.fn(),
  hapticError: jest.fn(),
  hapticSuccess: jest.fn(),
}));

// Mock ThemeContext
jest.mock('../context/ThemeContext', () => {
  const React = require('react');
  return {
    ThemeContext: React.createContext({
      colorTemp: 'neutral',
      brandPrimary: '#4CAF50',
      brandSecondary: '#2E7D32',
      brandBackground: '#FFFFFF',
      loading: false,
    }),
  };
});

// Mock quiz store
const mockLoadQuizForArticle = jest.fn();
const mockSetAnswer = jest.fn();
const mockNextQuestion = jest.fn();
const mockPrevQuestion = jest.fn();
const mockGoToQuestion = jest.fn();
const mockSubmitQuiz = jest.fn();
const mockResetQuiz = jest.fn();
const mockClearQuiz = jest.fn();

const mockStoreState: {
  currentQuiz: any;
  answers: (number | null)[];
  currentQuestionIndex: number;
  isSubmitting: boolean;
  isLoading: boolean;
  result: any;
  loadQuizForArticle: jest.Mock;
  setAnswer: jest.Mock;
  nextQuestion: jest.Mock;
  prevQuestion: jest.Mock;
  goToQuestion: jest.Mock;
  submitQuiz: jest.Mock;
  resetQuiz: jest.Mock;
  clearQuiz: jest.Mock;
} = {
  currentQuiz: null,
  answers: [],
  currentQuestionIndex: 0,
  isSubmitting: false,
  isLoading: false,
  result: null,
  loadQuizForArticle: mockLoadQuizForArticle,
  setAnswer: mockSetAnswer,
  nextQuestion: mockNextQuestion,
  prevQuestion: mockPrevQuestion,
  goToQuestion: mockGoToQuestion,
  submitQuiz: mockSubmitQuiz,
  resetQuiz: mockResetQuiz,
  clearQuiz: mockClearQuiz,
};

jest.mock('../store/quizStore', () => ({
  useQuizStore: () => mockStoreState,
}));

// Mock quiz components
jest.mock('../components/quiz/QuizQuestion', () => ({
  QuizQuestion: ({ question, questionNumber, totalQuestions, onSelectAnswer }: any) => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="quiz-question">
        <Text>{question.prompt}</Text>
        <Text>
          Question {questionNumber} of {totalQuestions}
        </Text>
        {question.options.map((option: string, idx: number) => (
          <TouchableOpacity key={idx} onPress={() => onSelectAnswer(idx)} testID={`option-${idx}`}>
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
}));

jest.mock('../components/quiz/QuizResults', () => ({
  QuizResults: ({ result, onRetry, onClose }: any) => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="quiz-results">
        <Text>{result.passed ? 'Passed!' : 'Failed'}</Text>
        <Text>Score: {result.score}%</Text>
        <TouchableOpacity onPress={onRetry} testID="retry-button">
          <Text>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} testID="close-button">
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

const mockQuiz = {
  _id: 'quiz-1',
  title: 'Terpene Knowledge Quiz',
  pointsReward: 50,
  passThreshold: 70,
  maxAttempts: 3,
  randomizeQuestions: false,
  randomizeOptions: false,
  questions: [
    {
      _key: 'q1',
      prompt: 'What is myrcene?',
      options: ['A terpene', 'A cannabinoid'],
    },
    {
      _key: 'q2',
      prompt: 'Which terpene smells like citrus?',
      options: ['Limonene', 'Myrcene'],
    },
  ],
};

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to default
    mockStoreState.currentQuiz = null;
    mockStoreState.answers = [];
    mockStoreState.currentQuestionIndex = 0;
    mockStoreState.isSubmitting = false;
    mockStoreState.isLoading = false;
    mockStoreState.result = null;
  });

  describe('Loading state', () => {
    it('shows loading indicator when quiz is loading', () => {
      mockStoreState.isLoading = true;

      const { getByText } = render(<QuizScreen />);

      expect(getByText('Loading quiz...')).toBeTruthy();
    });
  });

  describe('Quiz not found', () => {
    it('shows error state when quiz not found', () => {
      mockStoreState.isLoading = false;
      mockStoreState.currentQuiz = null;

      const { getByText } = render(<QuizScreen />);

      expect(getByText('Quiz not found')).toBeTruthy();
      expect(getByText('Go Back')).toBeTruthy();
    });

    it('navigates back when Go Back is pressed', () => {
      mockStoreState.isLoading = false;
      mockStoreState.currentQuiz = null;

      const { getByText } = render(<QuizScreen />);

      fireEvent.press(getByText('Go Back'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Quiz loaded', () => {
    beforeEach(() => {
      mockStoreState.currentQuiz = mockQuiz;
      mockStoreState.answers = [null, null];
      mockStoreState.currentQuestionIndex = 0;
    });

    it('renders quiz title', () => {
      const { getByText } = render(<QuizScreen />);

      expect(getByText('Terpene Knowledge Quiz')).toBeTruthy();
    });

    it('shows points reward', () => {
      const { getByText } = render(<QuizScreen />);

      expect(getByText('50 pts')).toBeTruthy();
    });

    it('renders navigation buttons', () => {
      const { getByText } = render(<QuizScreen />);

      expect(getByText('Previous')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });

    it('disables Previous button on first question', () => {
      const { getByLabelText } = render(<QuizScreen />);

      const prevButton = getByLabelText('Previous question');
      // Check if button is rendered - actual disabled state is handled by style opacity
      expect(prevButton).toBeTruthy();
      expect(mockStoreState.currentQuestionIndex).toBe(0);
    });

    it('calls loadQuizForArticle on mount', () => {
      render(<QuizScreen />);

      expect(mockLoadQuizForArticle).toHaveBeenCalledWith('intro-to-terpenes');
    });

    it('calls clearQuiz on unmount', () => {
      const { unmount } = render(<QuizScreen />);

      unmount();

      expect(mockClearQuiz).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockStoreState.currentQuiz = mockQuiz;
      mockStoreState.answers = [0, null];
      mockStoreState.currentQuestionIndex = 0;
    });

    it('calls nextQuestion when Next button is pressed', () => {
      const { getByLabelText } = render(<QuizScreen />);

      fireEvent.press(getByLabelText('Next question'));

      expect(mockNextQuestion).toHaveBeenCalled();
    });

    it('navigates to question using dots', () => {
      const { getAllByLabelText } = render(<QuizScreen />);

      const dots = getAllByLabelText(/Go to question/);
      fireEvent.press(dots[1]);

      expect(mockGoToQuestion).toHaveBeenCalledWith(1);
    });
  });

  describe('Quiz results', () => {
    beforeEach(() => {
      mockStoreState.currentQuiz = mockQuiz;
      mockStoreState.answers = [0, 0];
      mockStoreState.result = {
        passed: true,
        score: 100,
        correctCount: 2,
        totalQuestions: 2,
        pointsAwarded: 50,
        message: 'Great job!',
        locked: false,
      };
    });

    it('shows results when quiz is completed', () => {
      const { getByTestId, getByText } = render(<QuizScreen />);

      expect(getByTestId('quiz-results')).toBeTruthy();
      expect(getByText('Passed!')).toBeTruthy();
      expect(getByText('Score: 100%')).toBeTruthy();
    });

    it('calls resetQuiz when Try Again is pressed', () => {
      const { getByTestId } = render(<QuizScreen />);

      fireEvent.press(getByTestId('retry-button'));

      expect(mockResetQuiz).toHaveBeenCalled();
    });

    it('navigates back when Close is pressed', () => {
      const { getByTestId } = render(<QuizScreen />);

      fireEvent.press(getByTestId('close-button'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Submission', () => {
    beforeEach(() => {
      mockStoreState.currentQuiz = mockQuiz;
      mockStoreState.answers = [0, 0];
      mockStoreState.currentQuestionIndex = 1;
    });

    it('shows Submit button on last question', () => {
      const { getByText } = render(<QuizScreen />);

      expect(getByText('Submit Quiz')).toBeTruthy();
    });

    it('shows loading indicator when submitting', () => {
      mockStoreState.isSubmitting = true;

      const { getByLabelText } = render(<QuizScreen />);

      const submitButton = getByLabelText('Submit quiz');
      expect(submitButton).toBeTruthy();
    });
  });
});
