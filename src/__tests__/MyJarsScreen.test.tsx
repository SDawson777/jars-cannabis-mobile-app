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
  colorTemp: 'neutral' as const,
  brandPrimary: '#000',
  brandSecondary: '#333',
  brandBackground: '#fff',
  brandAccent: '#0f0',
  cornerRadius: 8,
  logoUrl: undefined,
  elevation: 'soft' as const,
  loading: false,
  debugInfo: {
    weatherSource: 'time-of-day',
    lastUpdated: new Date('2024-01-01T00:00:00Z'),
  },
  cmsTheme: null,
  weatherSimulation: {
    enabled: false,
    condition: null,
  },
  setWeatherSimulation: jest.fn(),
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
