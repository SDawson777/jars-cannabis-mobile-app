import React, { createContext, useState, ReactNode } from 'react';

interface LoyaltyContextValue {
  points: number;
  addPoints: (pts: number) => void;
}

export const LoyaltyContext = createContext<LoyaltyContextValue>({
  points: 0,
  addPoints: () => {},
});

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);

  const addPoints = (pts: number) => {
    setPoints(prev => prev + pts);
  };

  return (
    <LoyaltyContext.Provider value={{ points, addPoints }}>{children}</LoyaltyContext.Provider>
  );
}
