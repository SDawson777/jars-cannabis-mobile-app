// src/context/ThemeContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import * as Location from 'expo-location';
import { getLocales } from 'expo-localization';

const OPEN_WEATHER_KEY = 'aa7128228c09cea5b92b508cf1a200bc';

// Tuned threshold constants
const COOL_THRESHOLD_METRIC = 12;        // °C below which we consider it 'cool'
const WARM_THRESHOLD_METRIC = 22;        // °C above which we consider it 'warm'
const COOL_THRESHOLD_IMPERIAL = 54;      // °F below which we consider it 'cool'
const WARM_THRESHOLD_IMPERIAL = 72;      // °F above which we consider it 'warm'

// Cloud-cover adjustment thresholds (percent)
const SUNNY_CLOUD_THRESHOLD = 30;        // clouds% below which we boost toward 'warm'
const CLOUDY_CLOUD_THRESHOLD = 70;       // clouds% above which we boost toward 'cool'

type ColorTemp = 'warm' | 'neutral' | 'cool';

interface ThemeContextValue {
  colorTemp: ColorTemp;
  jarsPrimary: string;
  jarsSecondary: string;
  jarsBackground: string;
  loading: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colorTemp: 'neutral',
  jarsPrimary: '#2E5D46',
  jarsSecondary: '#8CD24C',
  jarsBackground: '#F9F9F9',
  loading: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorTemp, setColorTemp] = useState<ColorTemp>('neutral');
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Time-of-day fallback
  const computeTimeTemp = (): ColorTemp => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'warm';      // morning
    if (hour >= 17 && hour < 20) return 'warm';     // golden hour
    if (hour >= 12 && hour < 17) return 'neutral';  // midday
    return 'cool';                                  // evening/night
  };

  useEffect(() => {
    (async () => {
      try {
        // start with time-based
        let temp: ColorTemp = computeTimeTemp();

        // 2. Pull measurementSystem from first locale entry
        const { measurementSystem } = getLocales()[0];  
        // measurementSystem is 'metric' | 'us' | 'uk' | null
        const usesImperial = measurementSystem === 'us';
        const units = usesImperial ? 'imperial' : 'metric';

        // 3. Request permission & fetch location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const { coords } = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = coords;

          // 4. Fetch weather with proper units
          const url = `https://api.openweathermap.org/data/2.5/weather` +
                      `?lat=${latitude}&lon=${longitude}` +
                      `&appid=${OPEN_WEATHER_KEY}` +
                      `&units=${units}`;
          const resp = await fetch(url);
          const data = await resp.json();
          const current = data.main?.temp as number | undefined;
          const clouds = data.clouds?.all as number | undefined; // percent

          if (current !== undefined) {
            // 5a. Apply temperature thresholds
            if (usesImperial) {
              if (current < COOL_THRESHOLD_IMPERIAL) temp = 'cool';
              else if (current > WARM_THRESHOLD_IMPERIAL) temp = 'warm';
              else temp = 'neutral';
            } else {
              if (current < COOL_THRESHOLD_METRIC) temp = 'cool';
              else if (current > WARM_THRESHOLD_METRIC) temp = 'warm';
              else temp = 'neutral';
            }
          }

          if (clouds !== undefined) {
            // 5b. Adjust based on cloudiness
            if (clouds > CLOUDY_CLOUD_THRESHOLD) {
              temp = temp === 'warm' ? 'neutral' : 'cool';
            } else if (clouds < SUNNY_CLOUD_THRESHOLD) {
              temp = temp === 'cool' ? 'neutral' : 'warm';
            }
          }
        }

        setColorTemp(temp);
      } catch (error) {
        console.warn('ThemeContext weather failed, falling back to time-based:', error);
        setColorTemp(computeTimeTemp());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 6. Dark-mode interplay
  const isDark = Appearance.getColorScheme() === 'dark';

  const value: ThemeContextValue = {
    colorTemp,
    jarsPrimary: isDark ? '#1B4029' : '#2E5D46',
    jarsSecondary: '#8CD24C',
    jarsBackground: isDark ? '#121212' : '#F9F9F9',
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
