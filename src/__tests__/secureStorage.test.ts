import { saveSecure, getSecure, deleteSecure } from '../utils/secureStorage';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSecure', () => {
    it('should save to SecureStore when available', async () => {
      mockedSecureStore.setItemAsync.mockResolvedValue(undefined);

      await saveSecure('testKey', 'testValue');

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('should fall back to AsyncStorage when SecureStore fails', async () => {
      mockedSecureStore.setItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await saveSecure('testKey', 'testValue');

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    });
  });

  describe('getSecure', () => {
    it('should get from SecureStore when value exists', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue('secureValue');

      const result = await getSecure('testKey');

      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('testKey');
      expect(result).toBe('secureValue');
    });

    it('should fall back to AsyncStorage when SecureStore returns null', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      mockedAsyncStorage.getItem.mockResolvedValue('asyncValue');

      const result = await getSecure('testKey');

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toBe('asyncValue');
    });

    it('should fall back to AsyncStorage when SecureStore throws', async () => {
      mockedSecureStore.getItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockedAsyncStorage.getItem.mockResolvedValue('fallbackValue');

      const result = await getSecure('testKey');

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toBe('fallbackValue');
    });

    it('should return null when both stores have no value', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getSecure('testKey');

      expect(result).toBeNull();
    });
  });

  describe('deleteSecure', () => {
    it('should delete from SecureStore when available', async () => {
      mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await deleteSecure('testKey');

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
    });

    it('should fall back to AsyncStorage when SecureStore fails', async () => {
      mockedSecureStore.deleteItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

      await deleteSecure('testKey');

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
    });
  });
});
