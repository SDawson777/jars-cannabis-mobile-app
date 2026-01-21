// src/screens/__tests__/NotificationSettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationSettingsScreen from '../NotificationSettingsScreen';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
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

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <NotificationSettingsScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Notifications')).toBeTruthy();
    });

    it('renders all notification options', () => {
      const { getByText } = renderScreen();
      expect(getByText('Email Notifications')).toBeTruthy();
      expect(getByText('SMS Notifications')).toBeTruthy();
      expect(getByText('Push Notifications')).toBeTruthy();
    });

    it('renders three switches', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);
      expect(switches.length).toBe(3);
    });
  });

  describe('Default Values', () => {
    it('email notifications is enabled by default', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);
      expect(switches[0].props.value).toBe(true);
    });

    it('SMS notifications is disabled by default', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);
      expect(switches[1].props.value).toBe(false);
    });

    it('push notifications is enabled by default', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);
      expect(switches[2].props.value).toBe(true);
    });
  });

  describe('Toggle Interactions', () => {
    it('toggles email notifications off', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      let switches = UNSAFE_getAllByType(Switch);

      // Initially true
      expect(switches[0].props.value).toBe(true);

      // Toggle off
      fireEvent(switches[0], 'onValueChange', false);

      switches = UNSAFE_getAllByType(Switch);
      expect(switches[0].props.value).toBe(false);
    });

    it('toggles SMS notifications on', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      let switches = UNSAFE_getAllByType(Switch);

      // Initially false
      expect(switches[1].props.value).toBe(false);

      // Toggle on
      fireEvent(switches[1], 'onValueChange', true);

      switches = UNSAFE_getAllByType(Switch);
      expect(switches[1].props.value).toBe(true);
    });

    it('toggles push notifications off', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');
      let switches = UNSAFE_getAllByType(Switch);

      // Initially true
      expect(switches[2].props.value).toBe(true);

      // Toggle off
      fireEvent(switches[2], 'onValueChange', false);

      switches = UNSAFE_getAllByType(Switch);
      expect(switches[2].props.value).toBe(false);
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
          <NotificationSettingsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Notifications')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <NotificationSettingsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Notifications')).toBeTruthy();
    });
  });
});
