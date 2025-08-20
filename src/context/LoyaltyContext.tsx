import React, { createContext, ReactNode } from 'react';

import { useLoyaltyStatus, type LoyaltyStatus } from '../api/hooks/useLoyaltyStatus';

interface LoyaltyContextValue {
  data: LoyaltyStatus | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const LoyaltyContext = createContext<LoyaltyContextValue>({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
});

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error } = useLoyaltyStatus();

  return (
    <LoyaltyContext.Provider value={{ data, isLoading, isError, error }}>
      {children}
    </LoyaltyContext.Provider>
  );
}
