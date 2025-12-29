import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useI18nContext } from '../i18n/I18nProvider';
import { saveSecure, getSecure } from '../utils/secureStorage';

interface SettingsContextState {
  biometricEnabled: boolean;
  setBiometricEnabled: (__value: boolean) => Promise<void>;
  locale: string;
  setLocale: (__value: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextState>({
  biometricEnabled: true,
  setBiometricEnabled: async () => {},
  locale: 'en',
  setLocale: async () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [biometricEnabled, setBiometricEnabledState] = useState(true);
  const [locale, setLocaleState] = useState('en');
  const i18n = useI18nContext();

  useEffect(() => {
    (async () => {
      const stored = await getSecure('useBiometricAuth');
      if (stored === 'false') setBiometricEnabledState(false);
    })();
    (async () => {
      const storedLocale = await AsyncStorage.getItem('locale');
      if (storedLocale) {
        setLocaleState(storedLocale);
        // use I18nProvider to set runtime locale
        try {
          i18n?.setLocale(storedLocale as any);
        } catch (_e) {
          void 0;
        }
      }
    })();
  }, []);

  const setBiometricEnabled = async (value: boolean) => {
    setBiometricEnabledState(value);
    await saveSecure('useBiometricAuth', String(value));
  };

  const setLocale = async (value: string) => {
    setLocaleState(value);
    try {
      i18n?.setLocale(value as any);
    } catch (_e) {
      void 0;
    }
    await AsyncStorage.setItem('locale', value);
  };

  return (
    <SettingsContext.Provider value={{ biometricEnabled, setBiometricEnabled, locale, setLocale }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
