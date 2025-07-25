import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    await AsyncStorage.setItem('jwtToken', newToken);
  };

  const clearAuth = async () => {
    setTokenState(null);
    await AsyncStorage.removeItem('jwtToken');
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        if (storedToken) setTokenState(storedToken);
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
