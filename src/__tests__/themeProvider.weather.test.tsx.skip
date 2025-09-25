import React, { useContext } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext, ThemeProvider } from '../context/ThemeContext';
import { logEvent } from '../utils/analytics';

// Mock dependencies
jest.mock('../utils/analytics');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ measurementSystem: 'metric' }]),
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Appearance: {
      getColorScheme: jest.fn(() => 'light'),
    },
  };
});

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test component to access theme context
const TestComponent = () => {
  const { colorTemp, debugInfo, weatherSimulation, loading } = useContext(ThemeContext);
  return (
    <>
      <Text testID="colorTemp">{colorTemp}</Text>
      <Text testID="weatherSource">{debugInfo.weatherSource}</Text>
      <Text testID="simulationEnabled">{weatherSimulation?.enabled ? 'true' : 'false'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      {debugInfo.fallbackReason && <Text testID="fallbackReason">{debugInfo.fallbackReason}</Text>}
    </>
  );
};

describe('ThemeProvider Weather Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    // Mock successful weather API response by default
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        main: { temp: 20 },
        clouds: { all: 30 },
        weather: [{ main: 'Clear' }],
      }),
    });

    // Mock location permissions granted by default
    const mockLocation = require('expo-location');
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });

    // Set API key
    process.env.EXPO_PUBLIC_OPENWEATHER_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
  });

  it('should use OpenWeather API when available', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('false');
    });

    expect(getByTestId('weatherSource').children[0]).toBe('openweather');
    expect(mockLogEvent).toHaveBeenCalledWith(
      'weather_theme_success',
      expect.objectContaining({
        weatherSource: 'openweather',
        temperature: 20,
      })
    );
  });

  it('should fallback to time-based when API key is missing', async () => {
    delete process.env.EXPO_PUBLIC_OPENWEATHER_KEY;

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('false');
    });

    expect(getByTestId('weatherSource').children[0]).toBe('time-of-day');
    expect(getByTestId('fallbackReason').children[0]).toContain('API key missing');
    expect(mockLogEvent).toHaveBeenCalledWith(
      'weather_theme_fallback',
      expect.objectContaining({
        reason: 'missing_api_key',
        fallbackSource: 'time-of-day',
      })
    );
  });

  it('should fallback to time-based when API request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('false');
    });

    expect(getByTestId('weatherSource').children[0]).toBe('time-of-day');
    expect(getByTestId('fallbackReason').children[0]).toContain('failed with status 404');
    expect(mockLogEvent).toHaveBeenCalledWith(
      'weather_theme_fallback',
      expect.objectContaining({
        reason: 'api_error',
        statusCode: 404,
      })
    );
  });

  it('should fallback to time-based when location permission is denied', async () => {
    const mockLocation = require('expo-location');
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('false');
    });

    expect(getByTestId('weatherSource').children[0]).toBe('time-of-day');
    expect(getByTestId('fallbackReason').children[0]).toContain('Location permission denied');
    expect(mockLogEvent).toHaveBeenCalledWith(
      'weather_theme_fallback',
      expect.objectContaining({
        reason: 'location_permission_denied',
      })
    );
  });

  it('should apply weather simulation when enabled', async () => {
    // Mock stored simulation settings
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        enabled: true,
        condition: 'rain',
      })
    );

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('false');
    });

    expect(getByTestId('simulationEnabled').children[0]).toBe('true');
    expect(getByTestId('colorTemp').children[0]).toBe('cool'); // Rain should make it cool
    expect(mockLogEvent).toHaveBeenCalledWith(
      'weather_theme_simulation',
      expect.objectContaining({
        condition: 'rain',
        simulatedTemp: 'cool',
      })
    );
  });

  it('should handle different simulation conditions', async () => {
    const simulationCases = [
      { condition: 'sunny', expectedTemp: 'warm' },
      { condition: 'rain', expectedTemp: 'cool' },
      { condition: 'snow', expectedTemp: 'cool' },
      { condition: 'cloudy', expectedTemp: 'neutral' },
    ];

    for (const { condition, expectedTemp } of simulationCases) {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          condition,
        })
      );

      const { getByTestId, unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').children[0]).toBe('false');
      });

      expect(getByTestId('colorTemp').children[0]).toBe(expectedTemp);

      unmount();
      jest.clearAllMocks();
    }
  });

  it('should save simulation settings to storage', async () => {
    const TestComponentWithSimulation = () => {
      const { setWeatherSimulation } = useContext(ThemeContext);

      React.useEffect(() => {
        setWeatherSimulation({
          enabled: true,
          condition: 'rain',
        });
      }, [setWeatherSimulation]);

      return <Text>Test</Text>;
    };

    render(
      <ThemeProvider>
        <TestComponentWithSimulation />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'weatherSimulation',
        JSON.stringify({
          enabled: true,
          condition: 'rain',
        })
      );
    });
  });

  it('should determine color temperature based on actual weather conditions', async () => {
    const weatherCases = [
      { temp: 10, clouds: 20, expectedTemp: 'cool' }, // Cold and clear
      { temp: 25, clouds: 20, expectedTemp: 'warm' }, // Warm and clear
      { temp: 18, clouds: 80, expectedTemp: 'cool' }, // Neutral temp but very cloudy
      { temp: 18, clouds: 20, expectedTemp: 'warm' }, // Neutral temp but very sunny
    ];

    for (const { temp, clouds, expectedTemp } of weatherCases) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          main: { temp },
          clouds: { all: clouds },
          weather: [{ main: 'Clear' }],
        }),
      });

      const { getByTestId, unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').children[0]).toBe('false');
      });

      expect(getByTestId('colorTemp').children[0]).toBe(expectedTemp);

      unmount();
      jest.clearAllMocks();
    }
  });
});
