import React, { createContext, ReactNode } from 'react';
import { useLoyaltyStatus } from '../api/hooks/useLoyaltyStatus';

interface LoyaltyContextValue {
  data: any;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export const LoyaltyContext = createContext<LoyaltyContextValue>({
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
});

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error } = useLoyaltyStatus();

  return (
    <LoyaltyContext.Provider value={{ data, isLoading, isError, error }}>
      {children}
    </LoyaltyContext.Provider>
  );
}
