// src/hooks/useLocalization.ts
// Localization & i18n - multiple languages, Sanity multi-locale fields

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';
import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// ============================================
// Types
// ============================================

export type SupportedLocale = 
  | 'en-US'
  | 'en-CA'
  | 'es-US'
  | 'es-MX'
  | 'fr-CA'
  | 'de-DE'
  | 'pt-BR'
  | 'zh-CN'
  | 'ja-JP'
  | 'ko-KR';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface TranslationBundle {
  locale: SupportedLocale;
  namespace: string;
  translations: Record<string, string>;
  version: string;
  updatedAt: string;
}

export interface LocalizedContent {
  _id: string;
  _type: string;
  [key: string]: LocalizedField | string | undefined;
}

export interface LocalizedField {
  _type: 'localeString' | 'localeText' | 'localeBlock';
  [locale: string]: string | unknown;
}

export interface LocalizationSettings {
  locale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  autoDetect: boolean;
  dateFormat: 'local' | 'iso' | 'relative';
  numberFormat: 'local' | 'compact';
  currencyDisplay: 'symbol' | 'code' | 'name';
}

export interface CurrencyFormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// ============================================
// Localization Context
// ============================================

interface LocalizationContextValue {
  locale: SupportedLocale;
  localeInfo: LocaleInfo | null;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, options?: CurrencyFormatOptions) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

const LOCALE_STORAGE_KEY = '@nimbus/locale';

// ============================================
// Localization Provider
// ============================================

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en-US');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: localeInfo } = useLocaleInfo(locale);
  const { data: bundle } = useTranslationBundle(locale, 'common');
  
  // Load saved locale on mount
  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((saved) => {
      if (saved && isValidLocale(saved)) {
        setLocaleState(saved as SupportedLocale);
      }
      setIsLoading(false);
    });
  }, []);
  
  // Update translations when bundle changes
  useEffect(() => {
    if (bundle) {
      setTranslations(bundle.translations);
    }
  }, [bundle]);
  
  const setLocale = useCallback(async (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    logEvent('locale_changed', { locale: newLocale });
  }, []);
  
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value));
      });
    }
    
    return translation;
  }, [translations]);
  
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  }, [locale]);
  
  const formatCurrency = useCallback((value: number, options?: CurrencyFormatOptions): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: options?.currency || localeInfo?.currency || 'USD',
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(value);
  }, [locale, localeInfo]);
  
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(d);
  }, [locale]);
  
  const formatRelativeTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (Math.abs(diffSecs) < 60) {
      return rtf.format(diffSecs, 'second');
    } else if (Math.abs(diffMins) < 60) {
      return rtf.format(diffMins, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else {
      return rtf.format(diffDays, 'day');
    }
  }, [locale]);
  
  const value: LocalizationContextValue = {
    locale,
    localeInfo: localeInfo || null,
    setLocale,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    isLoading,
  };
  
  return React.createElement(
    LocalizationContext.Provider,
    { value },
    children
  );
}

// ============================================
// Hook to use localization
// ============================================

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}

// ============================================
// API Hooks
// ============================================

/**
 * Hook to fetch available locales
 */
export function useAvailableLocales() {
  return useQuery<LocaleInfo[], Error>({
    queryKey: ['localization', 'locales'],
    queryFn: async () => {
      const res = await clientGet<{ locales: LocaleInfo[] }>(
        phase4Client,
        '/localization/locales'
      );
      return res.locales;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to fetch locale info
 */
export function useLocaleInfo(locale: SupportedLocale) {
  return useQuery<LocaleInfo, Error>({
    queryKey: ['localization', 'locale', locale],
    queryFn: async () => {
      return await clientGet<LocaleInfo>(
        phase4Client,
        `/localization/locales/${locale}`
      );
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch translation bundle
 */
export function useTranslationBundle(locale: SupportedLocale, namespace: string = 'common') {
  return useQuery<TranslationBundle, Error>({
    queryKey: ['localization', 'translations', locale, namespace],
    queryFn: async () => {
      return await clientGet<TranslationBundle>(
        phase4Client,
        '/localization/translations',
        { params: { locale, namespace } }
      );
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch multiple translation namespaces
 */
export function useTranslationBundles(locale: SupportedLocale, namespaces: string[]) {
  return useQuery<Record<string, TranslationBundle>, Error>({
    queryKey: ['localization', 'translations', locale, namespaces],
    queryFn: async () => {
      const res = await clientGet<{ bundles: Record<string, TranslationBundle> }>(
        phase4Client,
        '/localization/translations/bulk',
        { params: { locale, namespaces: namespaces.join(',') } }
      );
      return res.bundles;
    },
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch localized CMS content
 */
export function useLocalizedContent<T extends LocalizedContent>(
  contentType: string,
  contentId: string,
  locale?: SupportedLocale
) {
  const { locale: currentLocale } = useLocalization();
  const targetLocale = locale || currentLocale;
  
  return useQuery<T, Error>({
    queryKey: ['localization', 'content', contentType, contentId, targetLocale],
    queryFn: async () => {
      return await clientGet<T>(
        phase4Client,
        `/localization/content/${contentType}/${contentId}`,
        { params: { locale: targetLocale } }
      );
    },
    enabled: !!contentId,
  });
}

// ============================================
// Localization Settings Hooks
// ============================================

/**
 * Hook to fetch localization settings
 */
export function useLocalizationSettings() {
  return useQuery<LocalizationSettings, Error>({
    queryKey: ['localization', 'settings'],
    queryFn: async () => {
      return await clientGet<LocalizationSettings>(
        phase4Client,
        '/localization/settings'
      );
    },
  });
}

/**
 * Hook to update localization settings
 */
export function useUpdateLocalizationSettings() {
  const queryClient = useQueryClient();
  
  return useMutation<LocalizationSettings, Error, Partial<LocalizationSettings>>({
    mutationFn: async (settings: Partial<LocalizationSettings>) => {
      const result = await clientPost<Partial<LocalizationSettings>, LocalizationSettings>(
        phase4Client,
        '/localization/settings',
        settings
      );
      logEvent('localization_settings_updated', { fields: Object.keys(settings) });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localization', 'settings'] });
    },
  });
}

// ============================================
// Auto-detect Locale Hook
// ============================================

/**
 * Hook to auto-detect user's preferred locale
 */
export function useAutoDetectLocale() {
  const { data: availableLocales } = useAvailableLocales();
  
  const detectLocale = useCallback((): SupportedLocale => {
    // Try to get device/browser locale
    let deviceLocale: string | null = null;
    
    if (typeof navigator !== 'undefined') {
      deviceLocale = navigator.language || (navigator as { userLanguage?: string }).userLanguage || null;
    }
    
    if (deviceLocale && availableLocales) {
      // Try exact match first
      const exactMatch = availableLocales.find((l: LocaleInfo) => l.code === deviceLocale);
      if (exactMatch) {
        return exactMatch.code;
      }
      
      // Try language-only match (e.g., 'en' matches 'en-US')
      const languageCode = deviceLocale.split('-')[0];
      const languageMatch = availableLocales.find((l: LocaleInfo) => l.code.startsWith(languageCode));
      if (languageMatch) {
        return languageMatch.code;
      }
    }
    
    // Default to en-US
    return 'en-US';
  }, [availableLocales]);
  
  return { detectLocale };
}

// ============================================
// Pluralization Hook
// ============================================

/**
 * Hook for pluralization support
 */
export function usePlural() {
  const { locale } = useLocalization();
  
  const plural = useCallback((
    count: number,
    forms: { zero?: string; one: string; other: string; few?: string; many?: string }
  ): string => {
    const pluralRules = new Intl.PluralRules(locale);
    const rule = pluralRules.select(count);
    
    switch (rule) {
      case 'zero':
        return forms.zero || forms.other;
      case 'one':
        return forms.one;
      case 'few':
        return forms.few || forms.other;
      case 'many':
        return forms.many || forms.other;
      default:
        return forms.other;
    }
  }, [locale]);
  
  return { plural };
}

// ============================================
// List Formatting Hook
// ============================================

/**
 * Hook for formatting lists in locale-specific way
 */
export function useListFormatter() {
  const { locale } = useLocalization();
  
  const formatList = useCallback((
    items: string[],
    type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'
  ): string => {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type });
    return formatter.format(items);
  }, [locale]);
  
  return { formatList };
}

// ============================================
// Utility Functions
// ============================================

function isValidLocale(locale: string): locale is SupportedLocale {
  const validLocales: SupportedLocale[] = [
    'en-US', 'en-CA', 'es-US', 'es-MX', 'fr-CA',
    'de-DE', 'pt-BR', 'zh-CN', 'ja-JP', 'ko-KR'
  ];
  return validLocales.includes(locale as SupportedLocale);
}

/**
 * Helper to extract localized value from a Sanity localized field
 */
export function getLocalizedValue(
  field: LocalizedField | undefined,
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en-US'
): string {
  if (!field) return '';
  
  const value = field[locale] || field[fallbackLocale] || '';
  return typeof value === 'string' ? value : '';
}

/**
 * Helper to check if content has translation for locale
 */
export function hasTranslation(
  field: LocalizedField | undefined,
  locale: SupportedLocale
): boolean {
  if (!field) return false;
  return locale in field && !!field[locale];
}
