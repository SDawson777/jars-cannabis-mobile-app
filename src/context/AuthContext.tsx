import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define User type to match your API
export interface User {
  id: string;
  name: string;
  email: string;
  // add other fields as needed
}

// Context value shape
interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
}

// Create context with defaults
export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setToken: async () => {},
  setUser: async () => {},
  clearAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);

  // Persist token to AsyncStorage and state
  const setToken = async (newToken: string) => {
    setTokenState(newToken);
    await AsyncStorage.setItem('jwtToken', newToken);
  };

  // Persist user to AsyncStorage and state
  const setUser = async (newUser: User) => {
    setUserState(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  // Clear both token and user
  const clearAuth = async () => {
    setTokenState(null);
    setUserState(null);
    await AsyncStorage.multiRemove(['jwtToken', 'user']);
  };

  // On mount, load stored auth
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken) setTokenState(storedToken);
        if (storedUser) setUserState(JSON.parse(storedUser));
      } catch (e) {
        console.warn('Failed to load auth from storage', e);
      }
    };
    loadAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
