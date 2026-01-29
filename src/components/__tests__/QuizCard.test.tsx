// src/components/__tests__/QuizCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { QuizCard } from '../quiz/QuizCard';
import type { Quiz, QuizUserStatus } from '../../services/quizService';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock haptic feedback
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => {
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

const mockQuiz: Quiz = {
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

describe('QuizCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Eligible state', () => {
    it('renders quiz card with points reward', () => {
      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={null} articleSlug="intro-to-terpenes" />
      );

      expect(getByText(/Earn 50 pts/)).toBeTruthy();
      expect(getByText('Terpene Knowledge Quiz')).toBeTruthy();
      expect(getByText(/2 questions/)).toBeTruthy();
      expect(getByText('Start Quiz')).toBeTruthy();
    });

    it('navigates to quiz screen when pressed', () => {
      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={null} articleSlug="intro-to-terpenes" />
      );

      fireEvent.press(getByText('Start Quiz'));

      expect(mockNavigate).toHaveBeenCalledWith('QuizScreen', {
        articleSlug: 'intro-to-terpenes',
      });
    });
  });

  describe('Passed state', () => {
    it('shows completed status when user has passed', () => {
      const passedStatus: QuizUserStatus = {
        attemptCount: 1,
        passed: true,
        locked: true,
        rewarded: true,
        remainingAttempts: null,
        lastScore: 100,
        passedAt: new Date().toISOString(),
        pointsEarned: 50,
      };

      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={passedStatus} articleSlug="intro-to-terpenes" />
      );

      expect(getByText('Complete!')).toBeTruthy();
      expect(getByText('Points Earned!')).toBeTruthy();
    });

    it('does not navigate when already passed and rewarded', () => {
      const passedStatus: QuizUserStatus = {
        attemptCount: 1,
        passed: true,
        locked: true,
        rewarded: true,
        remainingAttempts: null,
        lastScore: 100,
        passedAt: new Date().toISOString(),
        pointsEarned: 50,
      };

      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={passedStatus} articleSlug="intro-to-terpenes" />
      );

      fireEvent.press(getByText('Points Earned!'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Max attempts reached state', () => {
    it('shows locked status when max attempts reached', () => {
      const lockedStatus: QuizUserStatus = {
        attemptCount: 3,
        passed: false,
        locked: true,
        rewarded: false,
        remainingAttempts: 0,
        lastScore: 50,
      };

      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={lockedStatus} articleSlug="intro-to-terpenes" />
      );

      // When locked, shows "Points Earned!" since user cannot retry
      expect(getByText('Points Earned!')).toBeTruthy();
    });

    it('does not navigate when locked', () => {
      const lockedStatus: QuizUserStatus = {
        attemptCount: 3,
        passed: false,
        locked: true,
        rewarded: false,
        remainingAttempts: 0,
        lastScore: 50,
      };

      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={lockedStatus} articleSlug="intro-to-terpenes" />
      );

      fireEvent.press(getByText('Points Earned!'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Previous attempts', () => {
    it('shows last score when user has attempted but not passed', () => {
      const attemptedStatus: QuizUserStatus = {
        attemptCount: 1,
        passed: false,
        locked: false,
        rewarded: false,
        remainingAttempts: 2,
        lastScore: 50,
      };

      const { getByText } = render(
        <QuizCard quiz={mockQuiz} userStatus={attemptedStatus} articleSlug="intro-to-terpenes" />
      );

      expect(getByText(/Last attempt: 50%/)).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });
  });
});
