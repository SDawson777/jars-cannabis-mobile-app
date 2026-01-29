import { logEvent, trackEvent } from '../utils/analytics';
import { fetchJson } from '../utils/apiClient';
import logger from '../lib/logger';

jest.mock('../utils/apiClient');
jest.mock('../lib/logger');

const mockedFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure __DEV__ is true for console logging behavior
    (global as any).__DEV__ = true;
  });

  describe('logEvent', () => {
    it('should log event in development mode', () => {
      logEvent('test_event', { key: 'value' });

      expect(mockedLogger.log).toHaveBeenCalledWith('Analytics Event: test_event', {
        key: 'value',
      });
    });

    it('should send event to backend', () => {
      mockedFetchJson.mockResolvedValue({});

      logEvent('purchase', { product_id: '123', amount: 50 });

      expect(mockedFetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/track'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('purchase'),
          retries: 0,
        })
      );
    });

    it('should silently handle backend errors in dev mode', async () => {
      mockedFetchJson.mockRejectedValue(new Error('Network error'));

      // Should not throw
      logEvent('error_event', { error: 'test' });

      // Give time for the promise to resolve/reject
      await new Promise(resolve => setTimeout(resolve, 10));

      // Logger should have logged the failure in dev mode
      expect(mockedLogger.log).toHaveBeenCalledWith('Analytics Event: error_event', {
        error: 'test',
      });
    });

    it('should not block on failed analytics', () => {
      mockedFetchJson.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('slow failure')), 100);
          })
      );

      // This should return immediately without waiting
      const start = Date.now();
      logEvent('fast_event', {});
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(50); // Should not block
    });
  });

  describe('trackEvent', () => {
    it('should be an alias for logEvent', () => {
      expect(trackEvent).toBe(logEvent);
    });

    it('should work the same as logEvent', () => {
      trackEvent('track_event', { data: 'test' });

      expect(mockedLogger.log).toHaveBeenCalledWith('Analytics Event: track_event', {
        data: 'test',
      });
    });
  });
});
