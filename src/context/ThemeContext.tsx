// src/context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { fetchJson } from '../utils/apiClient';
import { API_BASE_URL } from '../utils/apiConfig';
import * as Location from 'expo-location';
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';

import logger from '../lib/logger';
import { logEvent } from '../utils/analytics';
import { useBrandData } from './BrandContext';
import type { CMSTheme } from '../types/cmsExtra';

const EXPO_PUBLIC_OPENWEATHER_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY as string;
const CMS_THEME_CACHE_KEY = 'cms:theme';

// Tuned threshold constants
const COOL_THRESHOLD_METRIC = 12; // °C below which we consider it 'cool'
const WARM_THRESHOLD_METRIC = 22; // °C above which we consider it 'warm'
const COOL_THRESHOLD_IMPERIAL = 54; // °F below which we consider it 'cool'
const WARM_THRESHOLD_IMPERIAL = 72; // °F above which we consider it 'warm'

// Cloud-cover adjustment thresholds (percent)
const SUNNY_CLOUD_THRESHOLD = 30; // clouds% below which we boost toward 'warm'
const CLOUDY_CLOUD_THRESHOLD = 70; // clouds% above which we boost toward 'cool'

type ColorTemp = 'warm' | 'neutral' | 'cool';
type WeatherSource = 'openweather' | 'time-of-day';

// Dev simulation options
interface WeatherSimulation {
  enabled: boolean;
  condition: 'rain' | 'sunny' | 'cloudy' | 'snow' | null;
  temperature?: number; // Override temperature
}

interface DebugInfo {
  weatherSource: WeatherSource;
  lastUpdated: Date;
  fallbackReason?: string;
  actualTemperature?: number;
  actualCondition?: string;
  cloudCover?: number;
  location?: { lat: number; lon: number };
  simulation?: WeatherSimulation;
}

interface ThemeContextValue {
  colorTemp: ColorTemp;
  brandPrimary: string;
  brandSecondary: string;
  brandBackground: string;
  brandAccent: string;
  cornerRadius: number;
  logoUrl: string | undefined;
  elevation: 'flat' | 'soft' | 'prominent';
  loading: boolean;
  debugInfo: DebugInfo;
  cmsTheme: CMSTheme | null;
  // Dev simulation controls
  weatherSimulation: WeatherSimulation;
  setWeatherSimulation: (simulation: WeatherSimulation) => void;
}

// Default CMS theme fallback
const DEFAULT_CMS_THEME: CMSTheme = {
  brandSlug: 'default',
  primaryColor: '#2E5D46',
  secondaryColor: '#8CD24C',
  backgroundColor: '#F9F9F9',
  accentColor: '#FFD700',
  cornerRadius: 12,
  darkModeEnabled: false,
  elevation: 'soft',
};

export const ThemeContext = createContext<ThemeContextValue>({
  colorTemp: 'neutral',
  brandPrimary: DEFAULT_CMS_THEME.primaryColor,
  brandSecondary: DEFAULT_CMS_THEME.secondaryColor,
  brandBackground: DEFAULT_CMS_THEME.backgroundColor || '#F9F9F9',
  brandAccent: DEFAULT_CMS_THEME.accentColor || '#FFD700',
  cornerRadius: DEFAULT_CMS_THEME.cornerRadius || 12,
  logoUrl: undefined,
  elevation: DEFAULT_CMS_THEME.elevation || 'soft',
  loading: false,
  debugInfo: {
    weatherSource: 'time-of-day',
    lastUpdated: new Date(),
  },
  cmsTheme: null,
  weatherSimulation: {
    enabled: false,
    condition: null,
  },
  setWeatherSimulation: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get brand colors from BrandContext
  const brand = useBrandData();

  const [colorTemp, setColorTemp] = useState<ColorTemp>('neutral');
  const [loading, setLoading] = useState<boolean>(true);
  const [cmsTheme, setCmsTheme] = useState<CMSTheme | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    weatherSource: 'time-of-day',
    lastUpdated: new Date(),
  });
  const [weatherSimulation, setWeatherSimulation] = useState<WeatherSimulation>({
    enabled: false,
    condition: null,
  });

  // Fetch CMS theme on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Try to load cached theme first for faster startup
        const cached = await AsyncStorage.getItem(CMS_THEME_CACHE_KEY);
        if (cached && !cancelled) {
          setCmsTheme(JSON.parse(cached) as CMSTheme);
        }

        // Fetch fresh theme from CMS
        const brandSlug = brand.slug || process.env.EXPO_PUBLIC_BRAND_SLUG || 'default';
        const themeData = await fetchJson<CMSTheme>(
          `${API_BASE_URL}/content/theme?brand=${brandSlug}`,
          { retries: 2 }
        );

        if (!cancelled && themeData) {
          setCmsTheme(themeData);
          await AsyncStorage.setItem(CMS_THEME_CACHE_KEY, JSON.stringify(themeData));

          logEvent('cms_theme_loaded', {
            brandSlug: themeData.brandSlug,
            darkModeEnabled: themeData.darkModeEnabled,
          });
        }
      } catch (err) {
        logger.warn('Failed to fetch CMS theme, using defaults', { err });
        if (!cancelled && !cmsTheme) {
          setCmsTheme(DEFAULT_CMS_THEME);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [brand.slug]);

  // Load weather simulation settings from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('weatherSimulation');
        if (stored) {
          const simulation = JSON.parse(stored) as WeatherSimulation;
          setWeatherSimulation(simulation);
        }
      } catch (_error) {
        // Ignore storage errors, use defaults
      }
    })();
  }, []);

  // Save weather simulation settings to storage
  const updateWeatherSimulation = async (simulation: WeatherSimulation) => {
    setWeatherSimulation(simulation);
    try {
      await AsyncStorage.setItem('weatherSimulation', JSON.stringify(simulation));
    } catch (error) {
      logger.warn('Failed to save weather simulation settings', { error });
    }
  };

  // Helper to apply weather simulation
  const applyWeatherSimulation = (
    baseTemp: ColorTemp,
    baseInfo: DebugInfo
  ): { temp: ColorTemp; info: DebugInfo } => {
    if (!weatherSimulation?.enabled || !weatherSimulation.condition) {
      return { temp: baseTemp, info: baseInfo };
    }

    let simulatedTemp: ColorTemp = baseTemp;
    const condition = weatherSimulation.condition;

    // Apply simulation logic
    switch (condition) {
      case 'rain':
      case 'snow':
        simulatedTemp = 'cool';
        break;
      case 'sunny':
        simulatedTemp = 'warm';
        break;
      case 'cloudy':
        simulatedTemp = 'neutral';
        break;
    }

    // Log simulation event
    logEvent('weather_theme_simulation', {
      condition,
      originalTemp: baseTemp,
      simulatedTemp,
      weatherSource: baseInfo.weatherSource,
    });

    return {
      temp: simulatedTemp,
      info: {
        ...baseInfo,
        simulation: weatherSimulation,
        actualCondition: condition,
      },
    };
  };

  // 1. Time-of-day fallback
  const computeTimeTemp = (): ColorTemp => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'warm'; // morning
    if (hour >= 17 && hour < 20) return 'warm'; // golden hour
    if (hour >= 12 && hour < 17) return 'neutral'; // midday
    return 'cool'; // evening/night
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        // start with time-based
        let temp: ColorTemp = computeTimeTemp();
        let currentDebugInfo: DebugInfo = {
          weatherSource: 'time-of-day',
          lastUpdated: new Date(),
        };

        // Abort early if no API key provided
        if (!EXPO_PUBLIC_OPENWEATHER_KEY) {
          const reason = 'OpenWeather API key missing or invalid; using time-based theme.';
          logger.warn(reason);

          logEvent('weather_theme_fallback', {
            reason: 'missing_api_key',
            fallbackSource: 'time-of-day',
            colorTemp: temp,
          });

          currentDebugInfo = {
            ...currentDebugInfo,
            fallbackReason: reason,
          };

          setDebugInfo(currentDebugInfo);
          const { temp: finalTemp, info: finalInfo } = applyWeatherSimulation(
            temp,
            currentDebugInfo
          );
          if (!cancelled) setColorTemp(finalTemp);
          if (!cancelled) setDebugInfo(finalInfo);
          return;
        }

        const { measurementSystem } = getLocales()[0];
        const usesImperial = measurementSystem === 'us';
        const units = usesImperial ? 'imperial' : 'metric';

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const { coords } = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = coords;

          const url =
            `https://api.openweathermap.org/data/2.5/weather` +
            `?lat=${latitude}&lon=${longitude}` +
            `&appid=${EXPO_PUBLIC_OPENWEATHER_KEY}` +
            `&units=${units}`;
          try {
            const data = await fetchJson<any>(url, { retries: 1, signal: controller.signal });
            const current = data.main?.temp as number | undefined;
            const clouds = data.clouds?.all as number | undefined;
            const weatherCondition = data.weather?.[0]?.main?.toLowerCase() || 'unknown';

            currentDebugInfo = {
              weatherSource: 'openweather',
              lastUpdated: new Date(),
              actualTemperature: current,
              actualCondition: weatherCondition,
              cloudCover: clouds,
              location: { lat: latitude, lon: longitude },
            };

            if (current !== undefined) {
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
              if (clouds > CLOUDY_CLOUD_THRESHOLD) {
                temp = temp === 'warm' ? 'neutral' : 'cool';
              } else if (clouds < SUNNY_CLOUD_THRESHOLD) {
                temp = temp === 'cool' ? 'neutral' : 'warm';
              }
            }

            logEvent('weather_theme_success', {
              weatherSource: 'openweather',
              colorTemp: temp,
              temperature: current,
              condition: weatherCondition,
              cloudCover: clouds,
              units,
            });
          } catch (err) {
            const statusCode = (err && (err as any).status) || 'unknown';
            const reason = `OpenWeather request failed with status ${statusCode}; using time-based theme.`;
            logger.warn(reason);

            logEvent('weather_theme_fallback', {
              reason: 'api_error',
              statusCode,
              fallbackSource: 'time-of-day',
              colorTemp: temp,
            });

            currentDebugInfo = {
              ...currentDebugInfo,
              fallbackReason: reason,
            };

            if (!cancelled) setDebugInfo(currentDebugInfo);
            const { temp: finalTemp, info: finalInfo } = applyWeatherSimulation(
              temp,
              currentDebugInfo
            );
            if (!cancelled) setColorTemp(finalTemp);
            if (!cancelled) setDebugInfo(finalInfo);
            if (!cancelled) setLoading(false);
            return;
          }
        } else {
          const reason = 'Location permission denied; using time-based theme.';
          logger.warn(reason);

          logEvent('weather_theme_fallback', {
            reason: 'location_permission_denied',
            fallbackSource: 'time-of-day',
            colorTemp: temp,
          });

          currentDebugInfo = {
            ...currentDebugInfo,
            fallbackReason: reason,
          };
        }

        if (!cancelled) setDebugInfo(currentDebugInfo);
        const { temp: finalTemp, info: finalInfo } = applyWeatherSimulation(temp, currentDebugInfo);
        if (!cancelled) setColorTemp(finalTemp);
        if (!cancelled) setDebugInfo(finalInfo);
      } catch (error) {
        const reason = 'ThemeContext weather failed, falling back to time-based';
        logger.warn(reason, { error });

        logEvent('weather_theme_fallback', {
          reason: 'exception',
          error: error instanceof Error ? error.message : 'unknown',
          fallbackSource: 'time-of-day',
          colorTemp: computeTimeTemp(),
        });

        const fallbackInfo: DebugInfo = {
          weatherSource: 'time-of-day',
          lastUpdated: new Date(),
          fallbackReason: reason,
        };

        if (!cancelled) setDebugInfo(fallbackInfo);
        const { temp: finalTemp, info: finalInfo } = applyWeatherSimulation(
          computeTimeTemp(),
          fallbackInfo
        );
        if (!cancelled) setColorTemp(finalTemp);
        if (!cancelled) setDebugInfo(finalInfo);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        controller.abort();
      } catch {
        // ignore
      }
    };
  }, [weatherSimulation]); // Re-run when simulation changes

  // 6. Dark-mode interplay with brand colors
  // Use CMS theme's darkModeEnabled setting if available, otherwise fall back to system
  const systemDark = Appearance.getColorScheme() === 'dark';
  const isDark = cmsTheme?.darkModeEnabled ?? systemDark;

  // Helper function to darken colors for dark mode
  const adjustColorForDarkMode = (color: string) => {
    // Simple approach: if in dark mode, darken the color by reducing the brightness
    // For production, you might want a more sophisticated color manipulation
    if (!isDark) return color;

    // Extract RGB values and darken them
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Resolve colors: prefer CMS theme, fallback to brand context, then defaults
  const resolvedPrimary =
    cmsTheme?.primaryColor || brand.primaryColor || DEFAULT_CMS_THEME.primaryColor;
  const resolvedSecondary =
    cmsTheme?.secondaryColor || brand.secondaryColor || DEFAULT_CMS_THEME.secondaryColor;
  const resolvedBackground =
    cmsTheme?.backgroundColor || DEFAULT_CMS_THEME.backgroundColor || '#F9F9F9';
  const resolvedAccent = cmsTheme?.accentColor || DEFAULT_CMS_THEME.accentColor || '#FFD700';

  const value: ThemeContextValue = {
    colorTemp,
    brandPrimary: adjustColorForDarkMode(resolvedPrimary),
    brandSecondary: adjustColorForDarkMode(resolvedSecondary),
    brandBackground: isDark ? '#121212' : resolvedBackground,
    brandAccent: adjustColorForDarkMode(resolvedAccent),
    cornerRadius: cmsTheme?.cornerRadius ?? DEFAULT_CMS_THEME.cornerRadius ?? 12,
    logoUrl: cmsTheme?.logoUrl || brand.logoUrl,
    elevation: cmsTheme?.elevation ?? DEFAULT_CMS_THEME.elevation ?? 'soft',
    loading,
    debugInfo,
    cmsTheme,
    weatherSimulation,
    setWeatherSimulation: updateWeatherSimulation,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
