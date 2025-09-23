import {
  parseDeepLink,
  buildDeepLink,
  isJarsDeepLink,
  getAvailableRoutes,
  validateRoutePattern,
} from '../utils/deepLinkUtils';

describe('Deep Link Utilities', () => {
  describe('parseDeepLink', () => {
    it('should parse simple routes', () => {
      const result = parseDeepLink('jars://shop');
      expect(result).toEqual({
        routeName: 'ShopScreen',
        params: {},
      });
    });

    it('should parse routes with parameters', () => {
      const result = parseDeepLink('jars://shop/product/blue-dream');
      expect(result).toEqual({
        routeName: 'ProductDetail',
        params: { slug: 'blue-dream' },
      });
    });

    it('should parse routes with multiple parameters', () => {
      const result = parseDeepLink('jars://profile/addresses/edit/addr123');
      expect(result).toEqual({
        routeName: 'EditAddress',
        params: { addressId: 'addr123' },
      });
    });

    it('should handle HTTPS URLs', () => {
      const result = parseDeepLink('https://jars.app/education/article/terpenes-guide');
      expect(result).toEqual({
        routeName: 'ArticleDetail',
        params: { slug: 'terpenes-guide' },
      });
    });

    it('should handle www subdomain URLs', () => {
      const result = parseDeepLink('https://www.jars.app/profile');
      expect(result).toEqual({
        routeName: 'Profile',
        params: {},
      });
    });

    it('should handle root route', () => {
      const result = parseDeepLink('jars://');
      expect(result).toEqual({
        routeName: 'SplashScreen',
        params: {},
      });
    });

    it('should handle URLs with leading slash', () => {
      const result = parseDeepLink('jars:///cart');
      expect(result).toEqual({
        routeName: 'CartScreen',
        params: {},
      });
    });

    it('should return null for unmatched routes', () => {
      const result = parseDeepLink('jars://unknown/route');
      expect(result).toBeNull();
    });

    it('should return null for malformed URLs', () => {
      const result = parseDeepLink('not-a-valid-url');
      expect(result).toBeNull();
    });

    it('should handle complex nested routes', () => {
      const result = parseDeepLink('jars://jars/journal/item789');
      expect(result).toEqual({
        routeName: 'JournalEntry',
        params: { itemId: 'item789' },
      });
    });
  });

  describe('buildDeepLink', () => {
    it('should build simple routes', () => {
      const result = buildDeepLink('ShopScreen');
      expect(result).toBe('jars://shop');
    });

    it('should build routes with parameters', () => {
      const result = buildDeepLink('ProductDetail', { slug: 'blue-dream' });
      expect(result).toBe('jars://shop/product/blue-dream');
    });

    it('should build routes with multiple parameters', () => {
      const result = buildDeepLink('EditAddress', { addressId: 'addr123' });
      expect(result).toBe('jars://profile/addresses/edit/addr123');
    });

    it('should build journal entry routes', () => {
      const result = buildDeepLink('JournalEntry', { itemId: 'item789' });
      expect(result).toBe('jars://jars/journal/item789');
    });

    it('should build order details routes', () => {
      const result = buildDeepLink('OrderDetails', { orderId: 'order456' });
      expect(result).toBe('jars://order/order456');
    });

    it('should build store details routes', () => {
      const result = buildDeepLink('StoreDetails', { storeId: 'downtown' });
      expect(result).toBe('jars://store/downtown');
    });

    it('should build article detail routes', () => {
      const result = buildDeepLink('ArticleDetail', { slug: 'cannabis-101' });
      expect(result).toBe('jars://education/article/cannabis-101');
    });

    it('should build payment edit routes', () => {
      const result = buildDeepLink('EditPayment', { paymentId: 'pay789' });
      expect(result).toBe('jars://profile/payments/edit/pay789');
    });

    it('should throw error for unknown route', () => {
      expect(() => buildDeepLink('UnknownRoute')).toThrow('Route UnknownRoute not found');
    });

    it('should handle routes without parameters', () => {
      const result = buildDeepLink('HomeScreen');
      expect(result).toBe('jars://home');
    });

    it('should handle root route', () => {
      const result = buildDeepLink('SplashScreen');
      expect(result).toBe('jars://');
    });
  });

  describe('isJarsDeepLink', () => {
    it('should identify custom protocol URLs', () => {
      expect(isJarsDeepLink('jars://shop')).toBe(true);
    });

    it('should identify HTTPS app domain URLs', () => {
      expect(isJarsDeepLink('https://jars.app/profile')).toBe(true);
    });

    it('should identify HTTPS www subdomain URLs', () => {
      expect(isJarsDeepLink('https://www.jars.app/cart')).toBe(true);
    });

    it('should reject non-JARS URLs', () => {
      expect(isJarsDeepLink('https://example.com/shop')).toBe(false);
      expect(isJarsDeepLink('other://app')).toBe(false);
      expect(isJarsDeepLink('not-a-url')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isJarsDeepLink('')).toBe(false);
      expect(isJarsDeepLink('jars')).toBe(false);
      expect(isJarsDeepLink('https://jars.ap/shop')).toBe(false); // typo in domain
    });
  });

  describe('getAvailableRoutes', () => {
    it('should return all configured routes', () => {
      const routes = getAvailableRoutes();

      // Check for key routes to ensure the function works
      expect(routes.HomeScreen).toBe('home');
      expect(routes.ShopScreen).toBe('shop');
      expect(routes.ProductDetail).toBe('shop/product/:slug');
      expect(routes.CartScreen).toBe('cart');
      expect(routes.Profile).toBe('profile');
      expect(routes.TerpeneWheel).toBe('education/terpenes');
      expect(routes.MyJars).toBe('jars');
      expect(routes.Awards).toBe('awards');
    });

    it('should return a copy (not the original object)', () => {
      const routes1 = getAvailableRoutes();
      const routes2 = getAvailableRoutes();

      // Modify one and ensure the other is not affected
      routes1.TestRoute = 'test';
      expect(routes2.TestRoute).toBeUndefined();
    });
  });

  describe('validateRoutePattern', () => {
    it('should validate simple patterns', () => {
      expect(validateRoutePattern('shop')).toBe(true);
      expect(validateRoutePattern('profile/settings')).toBe(true);
      expect(validateRoutePattern('')).toBe(true);
    });

    it('should validate patterns with parameters', () => {
      expect(validateRoutePattern('shop/product/:slug')).toBe(true);
      expect(validateRoutePattern('profile/addresses/edit/:addressId')).toBe(true);
      expect(validateRoutePattern('order/:orderId')).toBe(true);
      expect(validateRoutePattern(':id')).toBe(true);
    });

    it('should validate patterns with multiple parameters', () => {
      expect(validateRoutePattern('user/:userId/post/:postId')).toBe(true);
      expect(validateRoutePattern(':category/:item/:id')).toBe(true);
    });

    it('should validate patterns with underscores in parameter names', () => {
      expect(validateRoutePattern('item/:item__id')).toBe(true);
      expect(validateRoutePattern('user/:user_profile__id')).toBe(true);
    });

    it('should validate patterns with numbers in parameter names', () => {
      expect(validateRoutePattern('item/:id2')).toBe(true);
      expect(validateRoutePattern('user/:user123')).toBe(true);
    });

    it('should reject invalid parameter syntax', () => {
      expect(validateRoutePattern('shop/:123invalid')).toBe(false); // starts with number
      expect(validateRoutePattern('shop/:invalid-param')).toBe(false); // contains dash
      expect(validateRoutePattern('shop/:invalid.param')).toBe(false); // contains dot
      expect(validateRoutePattern('shop/:invalid@param')).toBe(false); // contains @
      expect(validateRoutePattern('shop/:')).toBe(false); // empty parameter name
    });

    it('should handle edge cases', () => {
      expect(validateRoutePattern('normal/path')).toBe(true);
      expect(validateRoutePattern('path/with/many/segments')).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should round-trip build and parse for simple routes', () => {
      const built = buildDeepLink('ShopScreen');
      const parsed = parseDeepLink(built);

      expect(parsed).toEqual({
        routeName: 'ShopScreen',
        params: {},
      });
    });

    it('should round-trip build and parse for parameterized routes', () => {
      const built = buildDeepLink('ProductDetail', { slug: 'test-product' });
      const parsed = parseDeepLink(built);

      expect(parsed).toEqual({
        routeName: 'ProductDetail',
        params: { slug: 'test-product' },
      });
    });

    it('should round-trip build and parse for complex routes', () => {
      const built = buildDeepLink('EditAddress', { addressId: 'addr-123-abc' });
      const parsed = parseDeepLink(built);

      expect(parsed).toEqual({
        routeName: 'EditAddress',
        params: { addressId: 'addr-123-abc' },
      });
    });
  });
});
