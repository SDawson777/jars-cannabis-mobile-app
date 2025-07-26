import React, { createContext, useContext, useEffect } from 'react';
import type { StoreData } from '../@types/store';
import { usePreferredStore } from '../state/store';
import { usePreferredStoreId } from '../../store/usePreferredStore';

interface StoreContextState {
  preferredStore?: StoreData;
  setPreferredStore(store: StoreData): void;
}

const StoreContext = createContext<StoreContextState>({
  preferredStore: undefined,
  setPreferredStore: () => {},
});

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { preferredStore, setPreferredStore, hydrate } = usePreferredStore();
  const { hydrate: hydrateId } = usePreferredStoreId();

  useEffect(() => {
    hydrate();
    hydrateId();
  }, [hydrate, hydrateId]);

  return (
    <StoreContext.Provider value={{ preferredStore, setPreferredStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
