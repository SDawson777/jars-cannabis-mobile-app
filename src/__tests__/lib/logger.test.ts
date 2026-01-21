/**
 * @jest-environment node
 */

import * as Sentry from '@sentry/react-native';
import logger from '../../lib/logger';

// Sentry is mocked in jest.setup.ts
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('log', () => {
    it('logs message without metadata', () => {
      logger.log('Test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('Test message');
    });

    it('logs message with metadata', () => {
      logger.log('Test message', { key: 'value' });
      expect(consoleSpy.log).toHaveBeenCalledWith('Test message :: {"key":"value"}');
    });

    it('stringifies complex metadata', () => {
      logger.log('Complex', { nested: { data: [1, 2, 3] } });
      expect(consoleSpy.log).toHaveBeenCalledWith('Complex :: {"nested":{"data":[1,2,3]}}');
    });
  });

  describe('warn', () => {
    it('warns message without metadata', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Warning message');
    });

    it('warns message with metadata', () => {
      logger.warn('Warning message', { reason: 'test' });
      expect(consoleSpy.warn).toHaveBeenCalledWith('Warning message :: {"reason":"test"}');
    });
  });

  describe('error', () => {
    it('logs error without metadata', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error message');
    });

    it('logs error with metadata', () => {
      logger.error('Error message', { code: 500 });
      expect(consoleSpy.error).toHaveBeenCalledWith('Error message :: {"code":500}');
    });

    it('captures exception to Sentry when error object provided', () => {
      const err = new Error('Test error');
      logger.error('Error occurred', undefined, err);
      expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });

    it('logs message after capturing Sentry exception', () => {
      const err = new Error('Test error');
      logger.error('Sentry error', { context: 'test' }, err);
      expect(consoleSpy.error).toHaveBeenCalledWith('Sentry error :: {"context":"test"}');
    });

    it('logs message without metadata when error has no meta', () => {
      const err = new Error('Test error');
      logger.error('Simple error', undefined, err);
      expect(consoleSpy.error).toHaveBeenCalledWith('Simple error');
    });
  });
});
