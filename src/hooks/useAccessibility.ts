// src/hooks/useAccessibility.ts
// Dark mode & accessibility - themes, screen reader labels, font sizes, high contrast

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';
import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName, AccessibilityInfo, useColorScheme } from 'react-native';
import React from 'react';

// ============================================
// Types
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  accent: string;
  // High contrast variants
  highContrastText?: string;
  highContrastBackground?: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
}

export type FontScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface AccessibilitySettings {
  themeMode: ThemeMode;
  fontScale: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  boldText: boolean;
  screenReaderEnabled: boolean;
  hapticFeedback: boolean;
  buttonSize: 'normal' | 'large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  autoReadAloud: boolean;
  captions: boolean;
}

export interface AccessibilityLabel {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'image' | 'header' | 'text' | 'adjustable' | 'search' | 'tab';
  state?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
}

// ============================================
// Default Themes
// ============================================

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#4A7C59',
    secondary: '#8B9D83',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    accent: '#7B68EE',
    highContrastText: '#000000',
    highContrastBackground: '#FFFFFF',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 16, full: 9999 },
  shadows: {
    sm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    md: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
    lg: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#6AAB7B',
    secondary: '#9DB893',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#333333',
    error: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFD93D',
    info: '#5BC0DE',
    accent: '#9D8DF1',
    highContrastText: '#FFFFFF',
    highContrastBackground: '#000000',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2 },
    md: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
    lg: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  },
};

// ============================================
// Font Scale Mapping
// ============================================

const fontScales: Record<FontScale, number> = {
  xs: 0.85,
  sm: 0.92,
  md: 1.0,
  lg: 1.15,
  xl: 1.3,
  xxl: 1.5,
};

// ============================================
// Accessibility Context
// ============================================

interface AccessibilityContextValue {
  theme: Theme;
  settings: AccessibilitySettings;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setFontScale: (scale: FontScale) => Promise<void>;
  toggleHighContrast: () => Promise<void>;
  toggleReduceMotion: () => Promise<void>;
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  getFontSize: (baseSize: number) => number;
  getSpacing: (key: keyof Theme['spacing']) => number;
  isScreenReaderEnabled: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const SETTINGS_STORAGE_KEY = '@nimbus/accessibility_settings';

// ============================================
// Accessibility Provider
// ============================================

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    themeMode: 'system',
    fontScale: 'md',
    highContrast: false,
    reduceMotion: false,
    reduceTransparency: false,
    boldText: false,
    screenReaderEnabled: false,
    hapticFeedback: true,
    buttonSize: 'normal',
    colorBlindMode: 'none',
    autoReadAloud: false,
    captions: false,
  });
  
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  
  // Load saved settings
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_STORAGE_KEY).then((saved) => {
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    });
    
    // Check screen reader status
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    
    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Determine active theme
  const activeThemeMode = settings.themeMode === 'system' 
    ? (systemColorScheme || 'light')
    : settings.themeMode;
  
  const baseTheme = activeThemeMode === 'dark' ? darkTheme : lightTheme;
  
  // Apply high contrast if enabled
  const theme: Theme = settings.highContrast
    ? {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          text: baseTheme.colors.highContrastText || baseTheme.colors.text,
          background: baseTheme.colors.highContrastBackground || baseTheme.colors.background,
          border: activeThemeMode === 'dark' ? '#FFFFFF' : '#000000',
        },
      }
    : baseTheme;
  
  const saveSettings = useCallback(async (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  }, []);
  
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    await saveSettings({ ...settings, themeMode: mode });
    logEvent('theme_mode_changed', { mode });
  }, [settings, saveSettings]);
  
  const setFontScale = useCallback(async (scale: FontScale) => {
    await saveSettings({ ...settings, fontScale: scale });
    logEvent('font_scale_changed', { scale });
  }, [settings, saveSettings]);
  
  const toggleHighContrast = useCallback(async () => {
    const newValue = !settings.highContrast;
    await saveSettings({ ...settings, highContrast: newValue });
    logEvent('high_contrast_toggled', { enabled: newValue });
  }, [settings, saveSettings]);
  
  const toggleReduceMotion = useCallback(async () => {
    const newValue = !settings.reduceMotion;
    await saveSettings({ ...settings, reduceMotion: newValue });
    logEvent('reduce_motion_toggled', { enabled: newValue });
  }, [settings, saveSettings]);
  
  const updateSettings = useCallback(async (updates: Partial<AccessibilitySettings>) => {
    await saveSettings({ ...settings, ...updates });
    logEvent('accessibility_settings_updated', { fields: Object.keys(updates) });
  }, [settings, saveSettings]);
  
  const getFontSize = useCallback((baseSize: number): number => {
    return Math.round(baseSize * fontScales[settings.fontScale]);
  }, [settings.fontScale]);
  
  const getSpacing = useCallback((key: keyof Theme['spacing']): number => {
    const baseSpacing = theme.spacing[key];
    // Increase spacing for large button mode
    if (settings.buttonSize === 'large') {
      return Math.round(baseSpacing * 1.25);
    }
    return baseSpacing;
  }, [theme.spacing, settings.buttonSize]);
  
  const value: AccessibilityContextValue = {
    theme,
    settings,
    setThemeMode,
    setFontScale,
    toggleHighContrast,
    toggleReduceMotion,
    updateSettings,
    getFontSize,
    getSpacing,
    isScreenReaderEnabled,
  };
  
  return React.createElement(
    AccessibilityContext.Provider,
    { value },
    children
  );
}

// ============================================
// Hook to use accessibility
// ============================================

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// ============================================
// Theme-specific Hooks
// ============================================

/**
 * Hook to get current theme
 */
export function useTheme() {
  const { theme } = useAccessibility();
  return theme;
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode() {
  const { theme } = useAccessibility();
  return theme.mode === 'dark';
}

// ============================================
// Accessibility Label Hooks
// ============================================

/**
 * Hook to generate accessibility props for a component
 */
export function useAccessibilityProps(label: AccessibilityLabel) {
  return {
    accessible: true,
    accessibilityLabel: label.label,
    accessibilityHint: label.hint,
    accessibilityRole: label.role,
    accessibilityState: label.state,
  };
}

/**
 * Hook to announce to screen readers
 */
export function useAnnounce() {
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
  
  const announcePolite = useCallback((message: string) => {
    // For React Native, announceForAccessibility is used
    // On web, this would use aria-live="polite"
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
  
  return { announce, announcePolite };
}

// ============================================
// API Hooks
// ============================================

/**
 * Hook to fetch accessibility settings from server
 */
export function useSyncedAccessibilitySettings() {
  return useQuery<AccessibilitySettings, Error>({
    queryKey: ['accessibility', 'settings'],
    queryFn: async () => {
      return await clientGet<AccessibilitySettings>(
        phase4Client,
        '/user/accessibility'
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to sync accessibility settings to server
 */
export function useSyncAccessibilitySettings() {
  const queryClient = useQueryClient();
  
  return useMutation<AccessibilitySettings, Error, Partial<AccessibilitySettings>>({
    mutationFn: async (settings: Partial<AccessibilitySettings>) => {
      return await clientPost<Partial<AccessibilitySettings>, AccessibilitySettings>(
        phase4Client,
        '/user/accessibility',
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessibility', 'settings'] });
    },
  });
}

// ============================================
// Color Blind Mode Filters
// ============================================

/**
 * Hook to get color adjustments for color blind modes
 */
export function useColorBlindAdjustments() {
  const { settings } = useAccessibility();
  
  const adjustColor = useCallback((color: string): string => {
    if (settings.colorBlindMode === 'none') return color;
    
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    let adjustedR = r, adjustedG = g, adjustedB = b;
    
    switch (settings.colorBlindMode) {
      case 'protanopia':
        // Red-blind: shift reds toward yellows
        adjustedR = Math.round(0.567 * r + 0.433 * g);
        adjustedG = Math.round(0.558 * g + 0.442 * r);
        break;
      case 'deuteranopia':
        // Green-blind: shift greens toward yellows
        adjustedG = Math.round(0.7 * g + 0.3 * r);
        adjustedR = Math.round(0.625 * r + 0.375 * g);
        break;
      case 'tritanopia':
        // Blue-blind: shift blues toward cyans
        adjustedB = Math.round(0.95 * b + 0.05 * g);
        adjustedG = Math.round(0.9 * g + 0.1 * b);
        break;
    }
    
    // Convert back to hex
    const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
    return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
  }, [settings.colorBlindMode]);
  
  return { adjustColor };
}

// ============================================
// Motion Preferences Hook
// ============================================

/**
 * Hook to get animation duration based on reduce motion setting
 */
export function useAnimationDuration() {
  const { settings } = useAccessibility();
  
  const getDuration = useCallback((baseDuration: number): number => {
    if (settings.reduceMotion) {
      return 0; // No animation
    }
    return baseDuration;
  }, [settings.reduceMotion]);
  
  const shouldAnimate = !settings.reduceMotion;
  
  return { getDuration, shouldAnimate };
}

// ============================================
// Haptic Feedback Hook
// ============================================

/**
 * Hook for haptic feedback
 */
export function useHapticFeedback() {
  const { settings } = useAccessibility();
  
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => {
    if (!settings.hapticFeedback) return;
    
    // In React Native, use expo-haptics or react-native-haptic-feedback
    // This is a placeholder implementation
    try {
      // Would call native haptic API here
      console.log(`Haptic: ${type}`);
    } catch {
      // Haptics not available
    }
  }, [settings.hapticFeedback]);
  
  return { trigger };
}

// ============================================
// Text Style Hook
// ============================================

/**
 * Hook to get accessible text styles
 */
export function useAccessibleTextStyle() {
  const { theme, settings, getFontSize } = useAccessibility();
  
  const getTextStyle = useCallback((variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button') => {
    const baseStyles = {
      h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
      h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
      h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
      body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
      caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
      button: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    };
    
    const base = baseStyles[variant];
    
    return {
      fontSize: getFontSize(base.fontSize),
      lineHeight: getFontSize(base.lineHeight),
      fontWeight: settings.boldText ? '700' as const : base.fontWeight,
      color: theme.colors.text,
    };
  }, [getFontSize, settings.boldText, theme.colors.text]);
  
  return { getTextStyle };
}
