import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { StoreData } from '../@types/store';

interface PreferredStoreState {
  preferredStore?: StoreData;
  setPreferredStore: (__store: StoreData) => void;
  hydrate: () => Promise<void>;
}

export const usePreferredStore = create<PreferredStoreState>(
  (
    set: (
      updater:
        | Partial<PreferredStoreState>
        | ((s: PreferredStoreState) => Partial<PreferredStoreState>)
    ) => void
  ) => ({
    preferredStore: undefined,
    setPreferredStore: (__store: StoreData) => {
      set({ preferredStore: __store });
      SecureStore.setItemAsync('preferredStore', JSON.stringify(__store)).catch(() => {});
    },
    hydrate: async () => {
      try {
        const val = await SecureStore.getItemAsync('preferredStore');
        if (val) {
          set({ preferredStore: JSON.parse(val) });
        }
      } catch {
        // ignore hydration failures
      }
    },
  })
);
