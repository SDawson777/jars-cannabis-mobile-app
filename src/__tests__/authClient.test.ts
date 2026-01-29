import {
  authClient,
  requestPasswordReset,
  requestPasswordResetWithSignal,
} from '../clients/authClient';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
  })),
}));

describe('authClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should call forgot-password endpoint with email', async () => {
      const mockResponse = { data: { success: true, message: 'Email sent' } };
      (authClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await requestPasswordReset('test@example.com');

      expect(result).toEqual(mockResponse);
      expect(authClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('should handle errors', async () => {
      (authClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(requestPasswordReset('test@example.com')).rejects.toThrow('Network error');
    });
  });

  describe('requestPasswordResetWithSignal', () => {
    it('should call forgot-password endpoint with email and signal', async () => {
      const mockResponse = { data: { success: true } };
      const controller = new AbortController();
      (authClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await requestPasswordResetWithSignal('test@example.com', controller.signal);

      expect(result).toEqual(mockResponse);
      expect(authClient.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        { signal: controller.signal }
      );
    });

    it('should work without signal', async () => {
      const mockResponse = { data: { success: true } };
      (authClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await requestPasswordResetWithSignal('test@example.com');

      expect(result).toEqual(mockResponse);
      expect(authClient.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        { signal: undefined }
      );
    });
  });
});
