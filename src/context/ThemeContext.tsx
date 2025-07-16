// src/context/ThemeContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import * as Location from 'expo-location';

const OPEN_WEATHER_KEY = 'aa7128228c09cea5b92b508cf1a200bc';

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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorTemp, setColorTemp] = useState<ColorTemp>('neutral');
  const [loading, setLoading] = useState(true);

  // Determine base temp from hour
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
        // Start with time-based
        let temp = computeTimeTemp();

        // --- Optional weather integration ---
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = loc.coords;
          const resp = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_KEY}`
          );
          const data = await resp.json();
          const kelvin = data.main?.temp;
          if (kelvin) {
            const c = kelvin - 273.15;
            // cooler if below 15°C, warmer if above 25°C
            if (c < 15) temp = 'cool';
            else if (c > 25) temp = 'warm';
            else temp = 'neutral';
          }
        }

        setColorTemp(temp as ColorTemp);
      } catch (e) {
        console.warn('ThemeContext weather failed:', e);
        setColorTemp(computeTimeTemp());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Theme colors can also adjust if you want dark mode interplay:
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
