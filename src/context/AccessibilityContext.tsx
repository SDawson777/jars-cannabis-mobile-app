import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityState {
  increaseContrast: boolean;
  toggleContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [increaseContrast, setIncreaseContrast] = useState(false);
  const toggleContrast = () => setIncreaseContrast(v => !v);
  return (
    <AccessibilityContext.Provider value={{ increaseContrast, toggleContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be within AccessibilityProvider');
  return ctx;
}
