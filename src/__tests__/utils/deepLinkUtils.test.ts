/**
 * @jest-environment node
 */

import {
  parseDeepLink,
  buildDeepLink,
  isJarsDeepLink,
  getAvailableRoutes,
  validateRoutePattern,
} from '../../utils/deepLinkUtils';

// Mock logger
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the linking config
jest.mock('../../navigation/linking', () => ({
  linking: {
    prefixes: ['jars://', 'https://jars.app/', 'https://www.jars.app/'],
    config: {
      screens: {
        SplashScreen: '',
        HomeScreen: 'home',
        ShopScreen: 'shop',
        ProductDetail: 'shop/product/:slug',
        OrderDetails: 'order/:orderId',
        EditAddress: 'profile/addresses/edit/:addressId',
        Checkout: 'checkout',
        StoreDetails: 'store/:storeId',
      },
    },
  },
}));

describe('deepLinkUtils', () => {
  describe('parseDeepLink', () => {
    it('parses deep link with jars:// prefix', () => {
      const result = parseDeepLink('jars://home');
      expect(result).toEqual({ routeName: 'HomeScreen', params: {} });
    });

    it('parses deep link with https://jars.app/ prefix', () => {
      const result = parseDeepLink('https://jars.app/shop');
      expect(result).toEqual({ routeName: 'ShopScreen', params: {} });
    });

    it('parses deep link with https://www.jars.app/ prefix', () => {
      const result = parseDeepLink('https://www.jars.app/checkout');
      expect(result).toEqual({ routeName: 'Checkout', params: {} });
    });

    it('parses deep link with path parameters', () => {
      const result = parseDeepLink('jars://shop/product/blue-dream');
      expect(result).toEqual({
        routeName: 'ProductDetail',
        params: { slug: 'blue-dream' },
      });
    });

    it('parses deep link with orderId parameter', () => {
      const result = parseDeepLink('jars://order/12345');
      expect(result).toEqual({
        routeName: 'OrderDetails',
        params: { orderId: '12345' },
      });
    });

    it('handles root route (empty pattern)', () => {
      const result = parseDeepLink('jars://');
      expect(result).toEqual({ routeName: 'SplashScreen', params: {} });
    });

    it('handles leading slash in path', () => {
      const result = parseDeepLink('jars:///home');
      expect(result).toEqual({ routeName: 'HomeScreen', params: {} });
    });

    it('strips query string before matching', () => {
      const result = parseDeepLink('jars://shop?store=midtown');
      expect(result).toEqual({ routeName: 'ShopScreen', params: {} });
    });

    it('strips fragment before matching', () => {
      const result = parseDeepLink('jars://shop#section');
      expect(result).toEqual({ routeName: 'ShopScreen', params: {} });
    });

    it('returns null for unknown route', () => {
      const result = parseDeepLink('jars://unknown-route');
      expect(result).toBeNull();
    });

    it('returns null for malformed URL', () => {
      const result = parseDeepLink('not-a-valid-url');
      expect(result).toBeNull();
    });
  });

  describe('buildDeepLink', () => {
    it('builds deep link for simple route', () => {
      const result = buildDeepLink('HomeScreen');
      expect(result).toBe('jars://home');
    });

    it('builds deep link for route with parameter', () => {
      const result = buildDeepLink('ProductDetail', { slug: 'og-kush' });
      expect(result).toBe('jars://shop/product/og-kush');
    });

    it('builds deep link for order details', () => {
      const result = buildDeepLink('OrderDetails', { orderId: '98765' });
      expect(result).toBe('jars://order/98765');
    });

    it('builds deep link for address editing', () => {
      const result = buildDeepLink('EditAddress', { addressId: 'addr-123' });
      expect(result).toBe('jars://profile/addresses/edit/addr-123');
    });

    it('builds deep link for root route', () => {
      const result = buildDeepLink('SplashScreen');
      expect(result).toBe('jars://');
    });

    it('throws error for unknown route', () => {
      expect(() => buildDeepLink('NonExistentRoute')).toThrow(
        'Route NonExistentRoute not found in linking configuration'
      );
    });
  });

  describe('isJarsDeepLink', () => {
    it('returns true for jars:// prefix', () => {
      expect(isJarsDeepLink('jars://home')).toBe(true);
    });

    it('returns true for https://jars.app/ prefix', () => {
      expect(isJarsDeepLink('https://jars.app/shop')).toBe(true);
    });

    it('returns true for https://www.jars.app/ prefix', () => {
      expect(isJarsDeepLink('https://www.jars.app/checkout')).toBe(true);
    });

    it('returns false for other URLs', () => {
      expect(isJarsDeepLink('https://example.com/page')).toBe(false);
    });

    it('returns false for non-URL strings', () => {
      expect(isJarsDeepLink('just-some-text')).toBe(false);
    });
  });

  describe('getAvailableRoutes', () => {
    it('returns all available routes', () => {
      const routes = getAvailableRoutes();
      expect(routes).toHaveProperty('HomeScreen', 'home');
      expect(routes).toHaveProperty('ShopScreen', 'shop');
      expect(routes).toHaveProperty('ProductDetail', 'shop/product/:slug');
    });

    it('returns a copy of routes (not the original)', () => {
      const routes1 = getAvailableRoutes();
      const routes2 = getAvailableRoutes();
      expect(routes1).not.toBe(routes2);
      expect(routes1).toEqual(routes2);
    });
  });

  describe('validateRoutePattern', () => {
    it('returns true for valid simple pattern', () => {
      expect(validateRoutePattern('home')).toBe(true);
    });

    it('returns true for valid nested pattern', () => {
      expect(validateRoutePattern('shop/product')).toBe(true);
    });

    it('returns true for valid pattern with parameter', () => {
      expect(validateRoutePattern('shop/product/:slug')).toBe(true);
    });

    it('returns true for pattern with multiple parameters', () => {
      expect(validateRoutePattern('user/:userId/post/:postId')).toBe(true);
    });

    it('returns true for pattern with underscore in param', () => {
      expect(validateRoutePattern('item/:item_id')).toBe(true);
    });

    it('returns true for pattern with numbers in param', () => {
      expect(validateRoutePattern('v2/:resource1')).toBe(true);
    });

    it('returns false for empty parameter name', () => {
      expect(validateRoutePattern('shop/:')).toBe(false);
    });

    it('returns false for parameter starting with number', () => {
      expect(validateRoutePattern('item/:123id')).toBe(false);
    });

    it('returns false for empty parameter in middle', () => {
      expect(validateRoutePattern('shop/:/product')).toBe(false);
    });
  });
});
