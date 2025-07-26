import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferredStoreState {
  preferredStoreId?: string;
  setPreferredStoreId: (id: string) => void;
  hydrate: () => Promise<void>;
}

export const usePreferredStoreId = create<PreferredStoreState>((set) => ({
  preferredStoreId: undefined,
  setPreferredStoreId: (id) => {
    set({ preferredStoreId: id });
    AsyncStorage.setItem('preferredStoreId', id).catch(() => {});
  },
  hydrate: async () => {
    try {
      const id = await AsyncStorage.getItem('preferredStoreId');
      if (id) set({ preferredStoreId: id });
    } catch {
      // ignore
    }
  },
}));
