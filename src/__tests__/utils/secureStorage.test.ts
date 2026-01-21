// src/__tests__/utils/secureStorage.test.ts
import { saveSecure, getSecure, deleteSecure } from '../../utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureStorage utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSecure', () => {
    it('should save to SecureStore when available', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await saveSecure('testKey', 'testValue');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey', 'testValue');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should fall back to AsyncStorage when SecureStore fails', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore unavailable')
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveSecure('testKey', 'testValue');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    });
  });

  describe('getSecure', () => {
    it('should get from SecureStore when available', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('storedValue');

      const result = await getSecure('testKey');

      expect(result).toBe('storedValue');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('testKey');
    });

    it('should fall back to AsyncStorage when SecureStore returns null', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('asyncValue');

      const result = await getSecure('testKey');

      expect(result).toBe('asyncValue');
    });

    it('should fall back to AsyncStorage when SecureStore fails', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore unavailable')
      );
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fallbackValue');

      const result = await getSecure('testKey');

      expect(result).toBe('fallbackValue');
    });
  });

  describe('deleteSecure', () => {
    it('should delete from SecureStore when available', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await deleteSecure('testKey');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should fall back to AsyncStorage when SecureStore fails', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore unavailable')
      );
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await deleteSecure('testKey');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
    });
  });
});
