import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { StoreData } from '../@types/store';

interface PreferredStoreState {
  preferredStore?: StoreData;
  setPreferredStore: (store: StoreData) => void;
  hydrate: () => Promise<void>;
}

export const usePreferredStore = create<PreferredStoreState>((set) => ({
  preferredStore: undefined,
  setPreferredStore: (store) => {
    set({ preferredStore: store });
    SecureStore.setItemAsync('preferredStore', JSON.stringify(store)).catch(() => {});
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

