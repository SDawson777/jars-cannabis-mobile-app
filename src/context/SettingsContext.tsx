import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { setLocale as setI18nLocale } from '../utils/i18n';
import { saveSecure, getSecure } from '../utils/secureStorage';

interface SettingsContextState {
  biometricEnabled: boolean;
  setBiometricEnabled: (_value: boolean) => Promise<void>;
  locale: string;
  setLocale: (_value: string) => Promise<void>;
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

  useEffect(() => {
    (async () => {
      const stored = await getSecure('useBiometricAuth');
      if (stored === 'false') setBiometricEnabledState(false);
    })();
    (async () => {
      const storedLocale = await AsyncStorage.getItem('locale');
      if (storedLocale) {
        setLocaleState(storedLocale);
        setI18nLocale(storedLocale);
      }
    })();
  }, []);

  const setBiometricEnabled = async (value: boolean) => {
    setBiometricEnabledState(value);
    await saveSecure('useBiometricAuth', String(value));
  };

  const setLocale = async (value: string) => {
    setLocaleState(value);
    setI18nLocale(value);
    await AsyncStorage.setItem('locale', value);
  };

  return (
    <SettingsContext.Provider value={{ biometricEnabled, setBiometricEnabled, locale, setLocale }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
