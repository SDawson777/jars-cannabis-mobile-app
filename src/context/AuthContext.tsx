import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
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
