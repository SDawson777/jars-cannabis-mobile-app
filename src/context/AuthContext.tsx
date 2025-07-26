import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import auth from '@react-native-firebase/auth';
import { Buffer } from 'buffer';
import { saveSecure, getSecure, deleteSecure } from '../utils/secureStorage';
import { useUserProfile, UserProfile } from '../api/hooks/useUserProfile';

export interface User extends UserProfile {}

interface AuthContextType {
  token: string | null;
  setToken: (token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  data: UserProfile | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: async () => {},
  clearAuth: async () => {},
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = async (newToken: string) => {
    setTokenState(newToken);
    await saveSecure('jwtToken', newToken);
    const user = auth().currentUser;
    if (user?.displayName) await saveSecure('userName', user.displayName);
    if (user?.email) await saveSecure('userEmail', user.email);
  };

  const clearAuth = async () => {
    setTokenState(null);
    await Promise.all([
      deleteSecure('jwtToken'),
      deleteSecure('userName'),
      deleteSecure('userEmail'),
    ]);
  };

  const isExpired = (t: string) => {
    try {
      const [, payload] = t.split('.');
      const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await getSecure('jwtToken');
        if (storedToken) {
          if (isExpired(storedToken)) {
            await clearAuth();
            Alert.alert('Session expired', 'Please log in again.');
          } else {
            const pref = await getSecure('useBiometricAuth');
            if (pref !== 'false') {
              const hasHardware = await LocalAuthentication.hasHardwareAsync();
              const enrolled = await LocalAuthentication.isEnrolledAsync();
              if (hasHardware && enrolled) {
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
                const useFace = types.includes(
                  LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
                );
                const usePrint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
                const promptMessage = useFace
                  ? 'Unlock Jars with Face ID'
                  : usePrint
                    ? 'Unlock Jars with Touch ID'
                    : 'Unlock Jars';
                const authPromise = LocalAuthentication.authenticateAsync({
                  promptMessage,
                  disableDeviceFallback: true,
                  cancelLabel: 'Cancel',
                });
                const result = await Promise.race([
                  authPromise,
                  new Promise<LocalAuthentication.LocalAuthenticationResult>(res =>
                    setTimeout(() => res({ success: false } as any), 10000)
                  ),
                ]);
                if (result.success) {
                  setTokenState(storedToken);
                  return;
                }
              } else if (!hasHardware) {
                Alert.alert('Biometric unlock not available on this device.');
              }
            }
            setTokenState(storedToken);
          }
        }
      } catch (e) {
        console.warn('Failed to load auth from storage', e);
      }
    };
    loadAuth();
  }, []);

  const { data, isLoading, isError, error } = useUserProfile();

  return (
    <AuthContext.Provider value={{ token, setToken, clearAuth, data, isLoading, isError, error }}>
      {children}
    </AuthContext.Provider>
  );
};
