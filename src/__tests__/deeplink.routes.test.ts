import {
  parseDeepLink,
  buildDeepLink,
  isJarsDeepLink,
  getAvailableRoutes,
} from '../utils/deepLinkUtils';

describe('Deep Link Routes', () => {
  describe('parseDeepLink', () => {
    it('should parse product deep link with slug parameter', () => {
      const url = 'jars://shop/product/blue-dream-indica';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'ProductDetail',
        params: { slug: 'blue-dream-indica' },
      });
    });

    it('should parse order details deep link with order ID', () => {
      const url = 'jars://order/abc123def456';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'OrderDetails',
        params: { orderId: 'abc123def456' },
      });
    });

    it('should parse store details deep link with store ID', () => {
      const url = 'jars://store/downtown-denver';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'StoreDetails',
        params: { storeId: 'downtown-denver' },
      });
    });

    it('should parse article detail deep link with slug', () => {
      const url = 'jars://education/article/cannabis-terpenes-guide';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'ArticleDetail',
        params: { slug: 'cannabis-terpenes-guide' },
      });
    });

    it('should parse journal entry deep link with item ID', () => {
      const url = 'jars://jars/journal/item789';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'JournalEntry',
        params: { itemId: 'item789' },
      });
    });

    it('should parse address edit deep link with address ID', () => {
      const url = 'jars://profile/addresses/edit/addr123';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'EditAddress',
        params: { addressId: 'addr123' },
      });
    });

    it('should parse payment edit deep link with payment ID', () => {
      const url = 'jars://profile/payments/edit/pay456';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'EditPayment',
        params: { paymentId: 'pay456' },
      });
    });

    it('should handle home route (empty path)', () => {
      const url = 'jars://';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'SplashScreen',
        params: {},
      });
    });

    it('should handle HTTPS URLs', () => {
      const url = 'https://jars.app/shop/product/og-kush';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'ProductDetail',
        params: { slug: 'og-kush' },
      });
    });

    it('should handle www subdomain URLs', () => {
      const url = 'https://www.jars.app/profile';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'Profile',
        params: {},
      });
    });

    it('should return null for invalid URLs', () => {
      const url = 'jars://invalid/path/that/does/not/exist';
      const result = parseDeepLink(url);

      expect(result).toBeNull();
    });

    it('should handle malformed URLs gracefully', () => {
      const url = 'not-a-valid-url';
      const result = parseDeepLink(url);

      expect(result).toBeNull();
    });

    it('should handle URLs with leading slash', () => {
      const url = 'jars:///shop';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        routeName: 'ShopScreen',
        params: {},
      });
    });
  });

  describe('buildDeepLink', () => {
    it('should build product detail link', () => {
      const url = buildDeepLink('ProductDetail', { slug: 'blue-dream' });
      expect(url).toBe('jars://shop/product/blue-dream');
    });

    it('should build order details link', () => {
      const url = buildDeepLink('OrderDetails', { orderId: 'order123' });
      expect(url).toBe('jars://order/order123');
    });

    it('should build static route without parameters', () => {
      const url = buildDeepLink('Profile');
      expect(url).toBe('jars://profile');
    });

    it('should throw error for non-existent route', () => {
      expect(() => {
        buildDeepLink('NonExistentRoute' as any);
      }).toThrow('Route NonExistentRoute not found in linking configuration');
    });

    it('should build complex nested route', () => {
      const url = buildDeepLink('EditAddress', { addressId: 'addr456' });
      expect(url).toBe('jars://profile/addresses/edit/addr456');
    });
  });

  describe('isJarsDeepLink', () => {
    it('should identify custom protocol URLs', () => {
      expect(isJarsDeepLink('jars://shop')).toBe(true);
    });

    it('should identify HTTPS app URLs', () => {
      expect(isJarsDeepLink('https://jars.app/profile')).toBe(true);
    });

    it('should identify www subdomain URLs', () => {
      expect(isJarsDeepLink('https://www.jars.app/cart')).toBe(true);
    });

    it('should reject non-JARS URLs', () => {
      expect(isJarsDeepLink('https://google.com')).toBe(false);
      expect(isJarsDeepLink('mailto:test@example.com')).toBe(false);
      expect(isJarsDeepLink('tel:+1234567890')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(isJarsDeepLink('')).toBe(false);
      expect(isJarsDeepLink('not-a-url')).toBe(false);
    });
  });

  describe('getAvailableRoutes', () => {
    it('should return all configured routes', () => {
      const routes = getAvailableRoutes();

      // Check that key routes are present
      expect(routes).toHaveProperty('HomeScreen');
      expect(routes).toHaveProperty('ShopScreen');
      expect(routes).toHaveProperty('ProductDetail');
      expect(routes).toHaveProperty('CartScreen');
      expect(routes).toHaveProperty('Profile');
      expect(routes).toHaveProperty('TerpeneWheel');

      // Check route patterns
      expect(routes.ProductDetail).toBe('shop/product/:slug');
      expect(routes.OrderDetails).toBe('order/:orderId');
      expect(routes.HomeScreen).toBe('home');
    });

    it('should include all required navigation routes', () => {
      const routes = getAvailableRoutes();
      const routeNames = Object.keys(routes);

      const requiredRoutes = [
        'SplashScreen',
        'Onboarding',
        'Login',
        'SignUp',
        'HomeScreen',
        'ShopScreen',
        'ProductDetail',
        'CartScreen',
        'Checkout',
        'Profile',
        'TerpeneWheel',
        'Awards',
        'EthicalAIDashboard',
      ];

      requiredRoutes.forEach(routeName => {
        expect(routeNames).toContain(routeName);
      });
    });
  });

  describe('URL pattern matching', () => {
    it('should match simple routes', () => {
      const testCases = [
        { url: 'jars://home', expected: 'HomeScreen' },
        { url: 'jars://shop', expected: 'ShopScreen' },
        { url: 'jars://cart', expected: 'CartScreen' },
        { url: 'jars://profile', expected: 'Profile' },
        { url: 'jars://awards', expected: 'Awards' },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = parseDeepLink(url);
        expect(result?.routeName).toBe(expected);
      });
    });

    it('should match parameterized routes', () => {
      const testCases = [
        {
          url: 'jars://shop/product/test-slug',
          expected: { routeName: 'ProductDetail', params: { slug: 'test-slug' } },
        },
        {
          url: 'jars://order/order-123',
          expected: { routeName: 'OrderDetails', params: { orderId: 'order-123' } },
        },
        {
          url: 'jars://store/store-456',
          expected: { routeName: 'StoreDetails', params: { storeId: 'store-456' } },
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = parseDeepLink(url);
        expect(result).toEqual(expected);
      });
    });

    it('should handle complex nested routes', () => {
      const testCases = [
        {
          url: 'jars://profile/addresses/edit/addr-789',
          expected: { routeName: 'EditAddress', params: { addressId: 'addr-789' } },
        },
        {
          url: 'jars://profile/payments/edit/pay-101',
          expected: { routeName: 'EditPayment', params: { paymentId: 'pay-101' } },
        },
        {
          url: 'jars://education/article/article-slug',
          expected: { routeName: 'ArticleDetail', params: { slug: 'article-slug' } },
        },
        {
          url: 'jars://jars/journal/item-202',
          expected: { routeName: 'JournalEntry', params: { itemId: 'item-202' } },
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = parseDeepLink(url);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle parsing errors gracefully', () => {
      // Mock console.warn to test error handling
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const invalidUrls = [null, undefined, 123, {}, 'jars://invalid/path/structure'];

      invalidUrls.forEach(url => {
        const result = parseDeepLink(url as any);
        expect(result).toBeNull();
      });

      consoleSpy.mockRestore();
    });

    it('should log parsing failures', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      parseDeepLink('jars://definitely/not/a/valid/route');

      // Should not log for valid failures (this is expected behavior)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
