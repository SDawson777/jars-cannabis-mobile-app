// src/__tests__/state/store.test.ts
import { usePreferredStore } from '../../state/store';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('usePreferredStore', () => {
  const mockStore = {
    id: 'store-1',
    name: 'Test Store',
    address: '123 Main St',
    latitude: 42.1234,
    longitude: -83.5678,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usePreferredStore.setState({ preferredStore: undefined });
  });

  describe('initial state', () => {
    it('should have undefined preferredStore initially', () => {
      const { preferredStore } = usePreferredStore.getState();
      expect(preferredStore).toBeUndefined();
    });
  });

  describe('setPreferredStore', () => {
    it('should set the preferred store', () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      usePreferredStore.getState().setPreferredStore(mockStore);

      const { preferredStore } = usePreferredStore.getState();
      expect(preferredStore).toEqual(mockStore);
    });

    it('should persist store to SecureStore', () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      usePreferredStore.getState().setPreferredStore(mockStore);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'preferredStore',
        JSON.stringify(mockStore)
      );
    });

    it('should handle SecureStore errors gracefully', () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      expect(() => {
        usePreferredStore.getState().setPreferredStore(mockStore);
      }).not.toThrow();
    });
  });

  describe('hydrate', () => {
    it('should load stored value from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockStore));

      await usePreferredStore.getState().hydrate();

      const { preferredStore } = usePreferredStore.getState();
      expect(preferredStore).toEqual(mockStore);
    });

    it('should not set preferredStore if nothing stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await usePreferredStore.getState().hydrate();

      const { preferredStore } = usePreferredStore.getState();
      expect(preferredStore).toBeUndefined();
    });

    it('should handle SecureStore errors gracefully', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(usePreferredStore.getState().hydrate()).resolves.not.toThrow();
    });
  });
});
