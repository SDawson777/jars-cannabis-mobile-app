// src/screens/__tests__/AppSettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AppSettingsScreen from '../AppSettingsScreen';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
const mockSetTextSize = jest.fn();
const mockSetHighContrast = jest.fn();
const mockSetReduceMotion = jest.fn();
const mockTogglePush = jest.fn();
const mockSetWeatherSimulation = jest.fn();

jest.mock('../../state/accessibilityStore', () => ({
  useAccessibilityStore: jest.fn(),
}));

jest.mock('../../hooks/useTextScaling', () => ({
  useTextScaling: jest.fn(),
}));

jest.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: jest.fn(),
}));

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.accessibility': 'Accessibility',
        'settings.textSize': 'Text Size',
        'settings.highContrast': 'High Contrast',
        'settings.reduceMotion': 'Reduce Motion',
        'settings.notifications': 'Notifications',
        'settings.pushNotifications': 'Push Notifications',
        'settings.weatherTheme': 'Weather Theme',
        'settings.simulateWeather': 'Simulate Weather',
        'settings.weatherCondition': 'Weather Condition',
        'settings.weatherDebug': 'Weather Debug',
        'settings.weatherDebugTitle': 'Weather Debug Info',
        'settings.demoBackend': 'Demo Backend',
        'settings.demoBackendTitle': 'Demo Backend Options',
        'settings.condition.none': 'None',
        'settings.condition.sunny': 'Sunny',
        'settings.condition.cloudy': 'Cloudy',
        'settings.condition.rain': 'Rain',
        'settings.condition.snow': 'Snow',
        'common.ok': 'OK',
        'common.view': 'View',
      };
      return translations[key] || key;
    },
  }),
}));

const mockTheme = {
  brandPrimary: '#3C5A47',
  brandSecondary: '#8FA998',
  brandBackground: '#FAF8F4',
  debugInfo: {
    weatherSource: 'mock',
    lastUpdated: new Date('2024-01-01'),
    fallbackReason: 'test reason',
    actualTemperature: 72,
    actualCondition: 'sunny',
    cloudCover: 20,
    location: { lat: 37.7749, lon: -122.4194 },
    simulation: { enabled: false, condition: null },
  },
  weatherSimulation: {
    enabled: false,
    condition: null,
  },
  setWeatherSimulation: mockSetWeatherSimulation,
};

const renderWithProviders = (ui, themeOverrides = {}) => {
  const theme = { ...mockTheme, ...themeOverrides };
  return render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);
};

describe('AppSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    // Setup default mock implementations
    const { useAccessibilityStore } = require('../../state/accessibilityStore');
    useAccessibilityStore.mockReturnValue({
      textSize: 'md',
      setTextSize: mockSetTextSize,
      highContrast: false,
      setHighContrast: mockSetHighContrast,
      reduceMotion: false,
      setReduceMotion: mockSetReduceMotion,
    });

    const { useTextScaling } = require('../../hooks/useTextScaling');
    useTextScaling.mockReturnValue({
      scaleSize: jest.fn(size => size),
    });

    const { usePushNotifications } = require('../../hooks/usePushNotifications');
    usePushNotifications.mockReturnValue({
      isEnabled: true,
      isLoading: false,
      togglePush: mockTogglePush,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the screen', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Accessibility')).toBeTruthy();
    });

    it('renders all sections', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Accessibility')).toBeTruthy();
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Weather Theme')).toBeTruthy();
    });

    it('renders text size setting', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Text Size')).toBeTruthy();
      expect(getByText('MD')).toBeTruthy();
    });

    it('renders high contrast setting', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('High Contrast')).toBeTruthy();
    });

    it('renders reduce motion setting', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Reduce Motion')).toBeTruthy();
    });

    it('renders push notifications setting', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Push Notifications')).toBeTruthy();
    });

    it('renders weather simulation setting', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Simulate Weather')).toBeTruthy();
    });
  });

  describe('Text Size Setting', () => {
    it('cycles through text sizes when pressed', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      const button = getByText('MD');

      fireEvent.press(button);

      expect(mockSetTextSize).toHaveBeenCalledWith('lg');
    });

    it('cycles from xl back to system', () => {
      const { useAccessibilityStore } = require('../../state/accessibilityStore');
      useAccessibilityStore.mockReturnValue({
        textSize: 'xl',
        setTextSize: mockSetTextSize,
        highContrast: false,
        setHighContrast: mockSetHighContrast,
        reduceMotion: false,
        setReduceMotion: mockSetReduceMotion,
      });

      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      const button = getByText('XL');

      fireEvent.press(button);

      expect(mockSetTextSize).toHaveBeenCalledWith('system');
    });
  });

  describe('High Contrast Setting', () => {
    it('toggles high contrast when switch is pressed', () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<AppSettingsScreen />);
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);

      // First switch is high contrast (after text size button)
      fireEvent(switches[0], 'valueChange', true);

      expect(mockSetHighContrast).toHaveBeenCalledWith(true);
    });

    it('applies high contrast colors when enabled', () => {
      const { useAccessibilityStore } = require('../../state/accessibilityStore');
      useAccessibilityStore.mockReturnValue({
        textSize: 'md',
        setTextSize: mockSetTextSize,
        highContrast: true,
        setHighContrast: mockSetHighContrast,
        reduceMotion: false,
        setReduceMotion: mockSetReduceMotion,
      });

      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      const label = getByText('Text Size');

      expect(label.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#000000' })])
      );
    });
  });

  describe('Reduce Motion Setting', () => {
    it('toggles reduce motion when switch is pressed', () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<AppSettingsScreen />);
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);

      // Second switch is reduce motion
      fireEvent(switches[1], 'valueChange', true);

      expect(mockSetReduceMotion).toHaveBeenCalledWith(true);
    });
  });

  describe('Push Notifications', () => {
    it('shows loading indicator when push is loading', () => {
      const { usePushNotifications } = require('../../hooks/usePushNotifications');
      usePushNotifications.mockReturnValue({
        isEnabled: true,
        isLoading: true,
        togglePush: mockTogglePush,
      });

      const { UNSAFE_getByType } = renderWithProviders(<AppSettingsScreen />);
      const { ActivityIndicator } = require('react-native');

      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('toggles push notifications when switch is pressed', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<AppSettingsScreen />);
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);

      // Third switch is push notifications
      fireEvent(switches[2], 'valueChange', false);

      expect(mockTogglePush).toHaveBeenCalledWith(false);
    });

    it('displays correct push notification state', () => {
      const { usePushNotifications } = require('../../hooks/usePushNotifications');
      usePushNotifications.mockReturnValue({
        isEnabled: false,
        isLoading: false,
        togglePush: mockTogglePush,
      });

      const { UNSAFE_getAllByType } = renderWithProviders(<AppSettingsScreen />);
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);

      // Third switch should be off
      expect(switches[2].props.value).toBe(false);
    });
  });

  describe('Weather Simulation', () => {
    it('toggles weather simulation when switch is pressed', () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<AppSettingsScreen />);
      const { Switch } = require('react-native');
      const switches = UNSAFE_getAllByType(Switch);

      // Fourth switch is weather simulation
      fireEvent(switches[3], 'valueChange', true);

      expect(mockSetWeatherSimulation).toHaveBeenCalledWith({
        enabled: true,
        condition: null,
      });
    });

    it('shows weather condition selector when simulation is enabled', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'sunny',
        },
      });

      expect(getByText('Weather Condition')).toBeTruthy();
      expect(getByText('Sunny')).toBeTruthy();
    });

    it('hides weather condition selector when simulation is disabled', () => {
      const { queryByText } = renderWithProviders(<AppSettingsScreen />);

      expect(queryByText('Weather Condition')).toBeNull();
    });

    it('cycles through weather conditions when pressed', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'sunny',
        },
      });

      const button = getByText('Sunny');
      fireEvent.press(button);

      expect(mockSetWeatherSimulation).toHaveBeenCalledWith({
        enabled: true,
        condition: 'cloudy',
      });
    });

    it('displays correct emoji for sunny condition', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'sunny',
        },
      });

      expect(getByText('☀️')).toBeTruthy();
    });

    it('displays correct emoji for rain condition', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'rain',
        },
      });

      expect(getByText('🌧️')).toBeTruthy();
      expect(getByText('Rain')).toBeTruthy();
    });

    it('displays correct emoji for snow condition', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'snow',
        },
      });

      expect(getByText('❄️')).toBeTruthy();
      expect(getByText('Snow')).toBeTruthy();
    });

    it('displays correct emoji for cloudy condition', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />, {
        weatherSimulation: {
          enabled: true,
          condition: 'cloudy',
        },
      });

      expect(getByText('☁️')).toBeTruthy();
      expect(getByText('Cloudy')).toBeTruthy();
    });
  });

  describe('Weather Debug', () => {
    it('renders weather debug button', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Weather Debug')).toBeTruthy();
    });

    it('shows debug info alert when pressed', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      // First View button is for weather debug
      fireEvent.press(viewButtons[0]);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Weather Debug Info',
        expect.stringContaining('Weather Source: mock'),
        [{ text: 'OK' }]
      );
    });

    it('includes temperature in debug info', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      fireEvent.press(viewButtons[0]);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Temperature: 72°'),
        expect.any(Array)
      );
    });

    it('includes location in debug info', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      fireEvent.press(viewButtons[0]);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Location: 37.7749, -122.4194'),
        expect.any(Array)
      );
    });
  });

  describe('Demo Backend Helper', () => {
    it('renders demo backend button', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      expect(getByText('Demo Backend')).toBeTruthy();
    });

    it('shows demo backend alert when pressed', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      // Second View button is for demo backend
      fireEvent.press(viewButtons[1]);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Demo Backend Options',
        expect.stringContaining('Demo Backend Options'),
        [{ text: 'OK' }]
      );
    });

    it('includes demo credentials in backend info', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      fireEvent.press(viewButtons[1]);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('buyer@demo.com'),
        expect.any(Array)
      );
    });

    it('includes docker instructions in backend info', () => {
      const { getAllByText } = renderWithProviders(<AppSettingsScreen />);
      const viewButtons = getAllByText('View');

      fireEvent.press(viewButtons[1]);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('docker-compose up -d'),
        expect.any(Array)
      );
    });
  });

  describe('Theme Integration', () => {
    it('applies theme background color', () => {
      const { UNSAFE_getByType } = renderWithProviders(<AppSettingsScreen />);
      const { SafeAreaView } = require('react-native');
      const container = UNSAFE_getByType(SafeAreaView);

      expect(container.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FAF8F4' })])
      );
    });

    it('applies theme text color to labels', () => {
      const { getByText } = renderWithProviders(<AppSettingsScreen />);
      const label = getByText('Text Size');

      expect(label.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#3C5A47' })])
      );
    });

    it('applies high contrast background when enabled', () => {
      const { useAccessibilityStore } = require('../../state/accessibilityStore');
      useAccessibilityStore.mockReturnValue({
        textSize: 'md',
        setTextSize: mockSetTextSize,
        highContrast: true,
        setHighContrast: mockSetHighContrast,
        reduceMotion: false,
        setReduceMotion: mockSetReduceMotion,
      });

      const { UNSAFE_getByType } = renderWithProviders(<AppSettingsScreen />);
      const { SafeAreaView } = require('react-native');
      const container = UNSAFE_getByType(SafeAreaView);

      expect(container.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FFFFFF' })])
      );
    });
  });
});
