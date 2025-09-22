// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

import * as Sentry from '@sentry/react-native';

import logger from '../lib/logger';

describe('Logger', () => {
  let consoleSpy: { log: jest.SpyInstance; warn: jest.SpyInstance; error: jest.SpyInstance };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('log', () => {
    it('should log a simple message', () => {
      logger.log('Test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('Test message');
    });

    it('should log a message with metadata', () => {
      const meta = { userId: '123', action: 'click' };
      logger.log('User action', meta);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        'User action :: {"userId":"123","action":"click"}'
      );
    });
  });

  describe('warn', () => {
    it('should warn a simple message', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Warning message');
    });

    it('should warn a message with metadata', () => {
      const meta = { component: 'AuthScreen', issue: 'deprecated prop' };
      logger.warn('Deprecated usage', meta);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Deprecated usage :: {"component":"AuthScreen","issue":"deprecated prop"}'
      );
    });
  });

  describe('error', () => {
    it('should log an error message', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error message');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should log an error message with metadata', () => {
      const meta = { endpoint: '/api/products', status: 500 };
      logger.error('API Error', meta);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'API Error :: {"endpoint":"/api/products","status":500}'
      );
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should log an error and capture exception in Sentry', () => {
      const error = new Error('Network timeout');
      const meta = { endpoint: '/api/cart', timeout: 5000 };

      logger.error('Request failed', meta, error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Request failed :: {"endpoint":"/api/cart","timeout":5000}'
      );
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should handle undefined error gracefully', () => {
      logger.error('Something went wrong', undefined, undefined);
      expect(consoleSpy.error).toHaveBeenCalledWith('Something went wrong');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('metadata formatting', () => {
    it('should handle complex metadata objects', () => {
      const meta = {
        user: { id: '123', name: 'John' },
        timestamp: '2024-01-01T00:00:00Z',
        config: { debug: true, version: '1.0.0' },
      };

      logger.log('Complex data', meta);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Complex data :: {"user":{"id":"123","name":"John"},"timestamp":"2024-01-01T00:00:00Z","config":{"debug":true,"version":"1.0.0"}}'
      );
    });

    it('should handle null and undefined metadata', () => {
      logger.log('No metadata', undefined);
      expect(consoleSpy.log).toHaveBeenCalledWith('No metadata');

      logger.log('Null metadata', null as any);
      expect(consoleSpy.log).toHaveBeenCalledWith('Null metadata :: null');
    });

    it('should handle empty metadata object', () => {
      logger.log('Empty metadata', {});
      expect(consoleSpy.log).toHaveBeenCalledWith('Empty metadata :: {}');
    });
  });

  describe('Sentry integration', () => {
    it('should only capture exceptions for error level', () => {
      const error = new Error('Test error');

      // logger.log and logger.warn don't accept an error argument; use logger.error to capture exceptions
      logger.log('Info message', {});
      logger.warn('Warning message', {});
      logger.error('Error message', {}, error);

      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should handle Sentry capture errors gracefully', () => {
      const originalCaptureException = Sentry.captureException;
      (Sentry.captureException as jest.Mock).mockImplementation(() => {
        throw new Error('Sentry error');
      });

      const error = new Error('Original error');

      expect(() => {
        logger.error('Error with Sentry failure', {}, error);
      }).not.toThrow();

      expect(consoleSpy.error).toHaveBeenCalledWith('Error with Sentry failure');

      // Restore original implementation
      (Sentry.captureException as jest.Mock).mockImplementation(originalCaptureException);
    });
  });
});
