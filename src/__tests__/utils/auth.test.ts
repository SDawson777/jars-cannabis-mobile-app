// src/__tests__/utils/auth.test.ts
import { getAuthToken, saveAuthToken, clearAuthToken } from '../../utils/auth';
import * as secureStorage from '../../utils/secureStorage';

jest.mock('../../utils/secureStorage', () => ({
  getSecure: jest.fn(),
  saveSecure: jest.fn(),
  deleteSecure: jest.fn(),
}));

describe('auth utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthToken', () => {
    it('should retrieve the JWT token from secure storage', async () => {
      (secureStorage.getSecure as jest.Mock).mockResolvedValue('test-jwt-token');

      const token = await getAuthToken();

      expect(token).toBe('test-jwt-token');
      expect(secureStorage.getSecure).toHaveBeenCalledWith('jwtToken');
    });

    it('should return null when no token exists', async () => {
      (secureStorage.getSecure as jest.Mock).mockResolvedValue(null);

      const token = await getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe('saveAuthToken', () => {
    it('should save the JWT token to secure storage', async () => {
      (secureStorage.saveSecure as jest.Mock).mockResolvedValue(undefined);

      await saveAuthToken('new-jwt-token');

      expect(secureStorage.saveSecure).toHaveBeenCalledWith('jwtToken', 'new-jwt-token');
    });
  });

  describe('clearAuthToken', () => {
    it('should delete the JWT token from secure storage', async () => {
      (secureStorage.deleteSecure as jest.Mock).mockResolvedValue(undefined);

      await clearAuthToken();

      expect(secureStorage.deleteSecure).toHaveBeenCalledWith('jwtToken');
    });
  });
});
