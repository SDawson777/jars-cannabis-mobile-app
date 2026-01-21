import {
  logEvent,
  trackContentView,
  trackContentClick,
  trackScreenView,
  trackCommerceEvent,
  trackEvent,
} from '../../utils/analytics';

// Mocking logger
jest.mock('../../lib/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));

// Mock fetchJson
jest.mock('../../utils/apiClient', () => ({
  fetchJson: jest.fn().mockResolvedValue({}),
}));

// Mock getAuthToken
jest.mock('../../utils/auth', () => ({
  getAuthToken: jest.fn().mockResolvedValue('mock-token'),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn().mockResolvedValue('mock-signature'),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

describe('analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log event without errors', () => {
      expect(() => logEvent('test_event', { key: 'value' })).not.toThrow();
    });

    it('should accept empty data', () => {
      expect(() => logEvent('empty_event', {})).not.toThrow();
    });

    it('should sanitize PII fields', () => {
      expect(() =>
        logEvent('user_action', {
          email: 'test@example.com',
          phone: '555-1234',
          name: 'Test User',
        })
      ).not.toThrow();
    });
  });

  describe('trackContentView', () => {
    it('should track content view event', () => {
      expect(() => trackContentView('article', 'article-123')).not.toThrow();
    });

    it('should track with metadata', () => {
      expect(() => trackContentView('product', 'prod-456', { source: 'search' })).not.toThrow();
    });
  });

  describe('trackContentClick', () => {
    it('should track content click event', () => {
      expect(() => trackContentClick('banner', 'banner-1')).not.toThrow();
    });

    it('should track with metadata', () => {
      expect(() => trackContentClick('deal', 'deal-1', { position: 1 })).not.toThrow();
    });
  });

  describe('trackScreenView', () => {
    it('should track screen view event', () => {
      expect(() => trackScreenView('HomeScreen')).not.toThrow();
    });

    it('should track with metadata', () => {
      expect(() => trackScreenView('ProductDetail', { productId: 'prod-123' })).not.toThrow();
    });
  });

  describe('trackCommerceEvent', () => {
    it('should track add to cart', () => {
      expect(() => trackCommerceEvent('add_to_cart', 'prod-123')).not.toThrow();
    });

    it('should track remove from cart', () => {
      expect(() => trackCommerceEvent('remove_from_cart', 'prod-456')).not.toThrow();
    });

    it('should track begin checkout', () => {
      expect(() => trackCommerceEvent('begin_checkout')).not.toThrow();
    });

    it('should track purchase with items', () => {
      expect(() =>
        trackCommerceEvent('purchase', [
          { product_id: 'prod-1', quantity: 2, price: 25 },
          { product_id: 'prod-2', quantity: 1, price: 50 },
        ])
      ).not.toThrow();
    });

    it('should track view item', () => {
      expect(() =>
        trackCommerceEvent('view_item', 'prod-789', { category: 'Flower' })
      ).not.toThrow();
    });
  });

  describe('trackEvent alias', () => {
    it('should be the same as logEvent', () => {
      expect(trackEvent).toBe(logEvent);
    });
  });
});
