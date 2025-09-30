import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface PreferredStoreState {
  preferredStoreId?: string;
  setPreferredStoreId: (_id: string) => void;
  hydrate: () => Promise<void>;
}

export const usePreferredStoreId = create<PreferredStoreState>(
  (
    set: (
      updater:
        | Partial<PreferredStoreState>
        | ((s: PreferredStoreState) => Partial<PreferredStoreState>)
    ) => void
  ) => ({
    preferredStoreId: undefined,
    setPreferredStoreId: (_id: string) => {
      set({ preferredStoreId: _id });
      AsyncStorage.setItem('preferredStoreId', _id).catch(() => {});
    },
    hydrate: async () => {
      try {
        const id = await AsyncStorage.getItem('preferredStoreId');
        if (id) set({ preferredStoreId: id });
      } catch {
        // ignore
      }
    },
  })
);
