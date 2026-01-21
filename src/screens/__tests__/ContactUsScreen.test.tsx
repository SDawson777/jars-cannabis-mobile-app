// src/screens/__tests__/ContactUsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ContactUsScreen from '../ContactUsScreen';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Phone: () => null,
  Mail: () => null,
  MessageCircle: () => null,
}));

jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Linking: {
      openURL: jest.fn(),
    },
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    UIManager: {
      setLayoutAnimationEnabledExperimental: jest.fn(),
    },
  };
});

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  brandAccent: '#4CAF50',
  cornerRadius: 8,
  textColor: '#2C3E50',
  isDark: false,
  logoUrl: undefined,
  elevation: 'soft' as const,
  loading: false,
  debugInfo: {
    weatherSource: 'time-of-day' as const,
    lastUpdated: new Date('2024-01-01'),
  },
  cmsTheme: null,
  weatherSimulation: { enabled: false, condition: null },
  setWeatherSimulation: jest.fn(),
};

describe('ContactUsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ContactUsScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Contact Us')).toBeTruthy();
    });

    it('renders Call Us option', () => {
      const { getByText } = renderScreen();
      expect(getByText('Call Us')).toBeTruthy();
    });

    it('renders Email Us option', () => {
      const { getByText } = renderScreen();
      expect(getByText('Email Us')).toBeTruthy();
    });

    it('renders In-App Chat option', () => {
      const { getByText } = renderScreen();
      expect(getByText('In-App Chat')).toBeTruthy();
    });
  });

  describe('Contact Actions', () => {
    it('opens phone dialer when Call Us is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Call Us'));

      expect(Linking.openURL).toHaveBeenCalledWith('tel:+18005551234');
    });

    it('opens email app when Email Us is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Email Us'));

      expect(Linking.openURL).toHaveBeenCalledWith('mailto:help@nimbus.app');
    });

    it('navigates to ConciergeChat when In-App Chat is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('In-App Chat'));

      expect(mockNavigate).toHaveBeenCalledWith('ConciergeChat');
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={coolTheme}>
          <ContactUsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Contact Us')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <ContactUsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Contact Us')).toBeTruthy();
    });
  });
});
