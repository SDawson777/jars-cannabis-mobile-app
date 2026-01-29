import React from 'react';
import { render } from '@testing-library/react-native';
import MyJarsScreen from '../screens/MyJarsScreen';
import { ThemeContext } from '../context/ThemeContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  BarChart: 'BarChart',
}));

const mockTheme = {
  brandPrimary: '#000',
  brandBackground: '#fff',
  textPrimary: '#000',
  textSecondary: '#666',
};

describe('MyJarsScreen', () => {
  it('should render my stash title', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <MyJarsScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('My Stash')).toBeTruthy();
  });

  it('should render empty state message', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <MyJarsScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('Your Stash Box is empty!')).toBeTruthy();
  });
});
