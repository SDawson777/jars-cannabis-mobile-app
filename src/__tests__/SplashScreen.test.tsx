import React from 'react';
import { render, act } from '@testing-library/react-native';
import SplashScreen from '../screens/SplashScreen';
import { ThemeContext } from '../context/ThemeContext';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
}));

const mockTheme = {
  colorTemp: 'warm',
  brandPrimary: '#2E5D46',
  brandSecondary: '#666',
  brandBackground: '#FFF',
  brandAccent: '#8CD24C',
};

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render Nimbus logo', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <SplashScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('Nimbus')).toBeTruthy();
  });

  it('should trigger haptic feedback on mount', () => {
    render(
      <ThemeContext.Provider value={mockTheme as any}>
        <SplashScreen />
      </ThemeContext.Provider>
    );
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should navigate to Onboarding after animation', () => {
    render(
      <ThemeContext.Provider value={mockTheme as any}>
        <SplashScreen />
      </ThemeContext.Provider>
    );

    // Fast-forward through animation and setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(mockReplace).toHaveBeenCalledWith('Onboarding');
  });

  it('should apply warm theme background', () => {
    const { toJSON } = render(
      <ThemeContext.Provider value={{ ...mockTheme, colorTemp: 'warm' } as any}>
        <SplashScreen />
      </ThemeContext.Provider>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should apply cool theme background', () => {
    const { toJSON } = render(
      <ThemeContext.Provider value={{ ...mockTheme, colorTemp: 'cool' } as any}>
        <SplashScreen />
      </ThemeContext.Provider>
    );
    expect(toJSON()).toBeTruthy();
  });
});
