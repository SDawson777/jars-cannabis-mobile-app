import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import en from '../locales/en.json';

export type Locale = 'en';

export interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCALES: Record<Locale, any> = {
  en,
};

function getByPath(obj: any, path: string) {
  return path.split(/[./]/).reduce((acc: any, p: string) => (acc ? acc[p] : undefined), obj);
}

function interpolate(template: string, vars?: Record<string, any>) {
  if (!vars) return template;
  return template.replace(/\{\{?\s*(\w+)\s*\}?\}/g, (_m, name) => {
    const v = vars[name];
    return v === undefined || v === null ? '' : String(v);
  });
}

export function I18nProvider({
  children,
  defaultLocale = 'en',
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, any>) => {
      const dict = LOCALES[locale] || LOCALES.en;
      const v = getByPath(dict, key);
      if (v === undefined) return key;
      if (typeof v === 'string') return interpolate(v, vars);
      return String(v);
    };
  }, [locale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18nContext must be used within I18nProvider');
  return ctx;
}
