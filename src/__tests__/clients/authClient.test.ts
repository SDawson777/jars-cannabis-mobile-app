import axios from 'axios';
import {
  authClient,
  requestPasswordReset,
  requestPasswordResetWithSignal,
} from '../../clients/authClient';

jest.mock('axios', () => {
  const mockPost = jest.fn();
  return {
    create: jest.fn(() => ({
      post: mockPost,
    })),
    __mockPost: mockPost,
  };
});

const mockPost = (axios as any).__mockPost;

describe('authClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authClient instance', () => {
    it('should be defined', () => {
      expect(authClient).toBeDefined();
    });

    it('should have post method', () => {
      expect(typeof authClient.post).toBe('function');
    });
  });

  describe('requestPasswordReset', () => {
    it('should call authClient.post with correct endpoint and email', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });

      await requestPasswordReset('test@example.com');

      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('should return response from authClient', async () => {
      const mockResponse = { data: { success: true, message: 'Email sent' } };
      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await requestPasswordReset('test@example.com');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('requestPasswordResetWithSignal', () => {
    it('should call authClient.post with abort signal', async () => {
      const controller = new AbortController();
      mockPost.mockResolvedValueOnce({ data: { success: true } });

      await requestPasswordResetWithSignal('test@example.com', controller.signal);

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        { signal: controller.signal }
      );
    });

    it('should work without signal', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });

      await requestPasswordResetWithSignal('test@example.com');

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        { signal: undefined }
      );
    });
  });
});
