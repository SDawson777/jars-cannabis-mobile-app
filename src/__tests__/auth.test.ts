import { getAuthToken, saveAuthToken, clearAuthToken } from '../utils/auth';
import * as secureStorage from '../utils/secureStorage';

jest.mock('../utils/secureStorage');

const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

describe('auth utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthToken', () => {
    it('should call getSecure with jwtToken key', async () => {
      mockedSecureStorage.getSecure.mockResolvedValue('test-token');

      const result = await getAuthToken();

      expect(mockedSecureStorage.getSecure).toHaveBeenCalledWith('jwtToken');
      expect(result).toBe('test-token');
    });

    it('should return null when no token exists', async () => {
      mockedSecureStorage.getSecure.mockResolvedValue(null);

      const result = await getAuthToken();

      expect(result).toBeNull();
    });
  });

  describe('saveAuthToken', () => {
    it('should call saveSecure with jwtToken key and token value', async () => {
      mockedSecureStorage.saveSecure.mockResolvedValue(undefined);

      await saveAuthToken('my-jwt-token');

      expect(mockedSecureStorage.saveSecure).toHaveBeenCalledWith('jwtToken', 'my-jwt-token');
    });
  });

  describe('clearAuthToken', () => {
    it('should call deleteSecure with jwtToken key', async () => {
      mockedSecureStorage.deleteSecure.mockResolvedValue(undefined);

      await clearAuthToken();

      expect(mockedSecureStorage.deleteSecure).toHaveBeenCalledWith('jwtToken');
    });
  });
});
