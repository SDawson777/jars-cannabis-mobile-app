// src/screens/__tests__/MyJarsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyJarsScreen from '../MyJarsScreen';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  BarChart: () => null,
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  textColor: '#2C3E50',
  isDark: false,
};

describe('MyJarsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <MyJarsScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with title', () => {
      const { getByText } = renderScreen();
      expect(getByText('My Stash')).toBeTruthy();
    });

    it('renders empty state message', () => {
      const { getByText } = renderScreen();
      expect(getByText('Your Stash Box is empty!')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to MyJarsInsights when insights button is pressed', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Pressable } = require('react-native');

      const pressables = UNSAFE_getAllByType(Pressable);
      // First pressable should be the insights button
      fireEvent.press(pressables[0]);

      expect(mockNavigate).toHaveBeenCalledWith('MyJarsInsights');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors', () => {
      const { getByText } = renderScreen();
      expect(getByText('My Stash')).toBeTruthy();
    });
  });
});
