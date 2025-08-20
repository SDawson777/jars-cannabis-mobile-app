import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { StoreData } from '../@types/store';

interface PreferredStoreState {
  preferredStore?: StoreData;
  setPreferredStore: (_store: StoreData) => void;
  hydrate: () => Promise<void>;
}

export const usePreferredStore = create<PreferredStoreState>(set => ({
  preferredStore: undefined,
  setPreferredStore: _store => {
    set({ preferredStore: _store });
    SecureStore.setItemAsync('preferredStore', JSON.stringify(_store)).catch(() => {});
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
}));
