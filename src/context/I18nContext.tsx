import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';

type Translations = typeof en;
type SupportedLocale = 'en'; // Add more locales here: 'es' | 'fr' | 'en'

const translations: Record<SupportedLocale, Translations> = {
  en,
  // Add more: es: esTranslations, fr: frTranslations
};

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = '@nimbus/locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((stored) => {
      if (stored && translations[stored as SupportedLocale]) {
        setLocaleState(stored as SupportedLocale);
      }
    });
  }, []);

  const setLocale = async (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') return key;

    // Simple templating: replace {{param}} with params.param
    if (params) {
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, 'g'), v),
        value
      );
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
