import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { saveSecure, getSecure } from '../utils/secureStorage';

interface SettingsContextState {
  biometricEnabled: boolean;
  setBiometricEnabled: (value: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextState>({
  biometricEnabled: true,
  setBiometricEnabled: async () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [biometricEnabled, setBiometricEnabledState] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getSecure('useBiometricAuth');
      if (stored === 'false') setBiometricEnabledState(false);
    })();
  }, []);

  const setBiometricEnabled = async (value: boolean) => {
    setBiometricEnabledState(value);
    await saveSecure('useBiometricAuth', String(value));
  };

  return (
    <SettingsContext.Provider value={{ biometricEnabled, setBiometricEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
