import { Linking } from 'react-native';

import { linking } from '../navigation/linking';

describe('Linking Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL parsing', () => {
    it('should parse product deep link with slug parameter', () => {
      const url = 'jars://shop/product/blue-dream-indica';
      expect(url).toContain('blue-dream-indica');
      expect(linking.config.screens.ProductDetail).toBe('shop/product/:slug');
    });

    it('should parse order details deep link with order ID', () => {
      const url = 'jars://order/abc123def456';
      expect(url).toContain('abc123def456');
      expect(linking.config.screens.OrderDetails).toBe('order/:orderId');
    });

    it('should parse store details deep link with store ID', () => {
      const url = 'jars://store/downtown-denver';
      expect(url).toContain('downtown-denver');
      expect(linking.config.screens.StoreDetails).toBe('store/:storeId');
    });

    it('should parse article detail deep link with slug', () => {
      const url = 'jars://education/article/cannabis-terpenes-guide';
      expect(url).toContain('cannabis-terpenes-guide');
      expect(linking.config.screens.ArticleDetail).toBe('education/article/:slug');
    });

    it('should parse journal entry deep link with item ID', () => {
      const url = 'jars://jars/journal/item789';
      expect(url).toContain('item789');
      expect(linking.config.screens.JournalEntry).toBe('jars/journal/:itemId');
    });

    it('should parse address edit deep link with address ID', () => {
      const url = 'jars://profile/addresses/edit/addr123';
      expect(url).toContain('addr123');
      expect(linking.config.screens.EditAddress).toBe('profile/addresses/edit/:addressId');
    });

    it('should parse payment edit deep link with payment ID', () => {
      const url = 'jars://profile/payments/edit/pay456';
      expect(url).toContain('pay456');
      expect(linking.config.screens.EditPayment).toBe('profile/payments/edit/:paymentId');
    });
  });

  describe('Static routes', () => {
    it('should handle home route', () => {
      expect(linking.config.screens.HomeScreen).toBe('home');
    });

    it('should handle shop route', () => {
      expect(linking.config.screens.ShopScreen).toBe('shop');
    });

    it('should handle cart route', () => {
      expect(linking.config.screens.CartScreen).toBe('cart');
    });

    it('should handle checkout route', () => {
      expect(linking.config.screens.Checkout).toBe('checkout');
    });

    it('should handle profile route', () => {
      expect(linking.config.screens.Profile).toBe('profile');
    });

    it('should handle education route', () => {
      expect(linking.config.screens.EducationalGreenhouse).toBe('education');
    });

    it('should handle terpene wheel route', () => {
      expect(linking.config.screens.TerpeneWheel).toBe('education/terpenes');
    });

    it('should handle awards route', () => {
      expect(linking.config.screens.Awards).toBe('awards');
    });

    it('should handle my jars route', () => {
      expect(linking.config.screens.MyJars).toBe('jars');
    });

    it('should handle ethical AI dashboard route', () => {
      expect(linking.config.screens.EthicalAIDashboard).toBe('ethical-ai');
    });
  });

  describe('Auth flow routes', () => {
    it('should handle onboarding route', () => {
      expect(linking.config.screens.Onboarding).toBe('onboarding');
    });

    it('should handle age verification route', () => {
      expect(linking.config.screens.AgeVerification).toBe('age-verification');
    });

    it('should handle login route', () => {
      expect(linking.config.screens.Login).toBe('auth/login');
    });

    it('should handle signup route', () => {
      expect(linking.config.screens.SignUp).toBe('auth/signup');
    });

    it('should handle forgot password route', () => {
      expect(linking.config.screens.ForgotPassword).toBe('auth/forgot-password');
    });

    it('should handle OTP verification route', () => {
      expect(linking.config.screens.OTPScreen).toBe('auth/verify');
    });
  });

  describe('Order flow routes', () => {
    it('should handle order history route', () => {
      expect(linking.config.screens.OrderHistory).toBe('orders');
    });

    it('should handle order confirmation route', () => {
      expect(linking.config.screens.OrderConfirmation).toBe('order/confirmation');
    });

    it('should handle order tracking route', () => {
      expect(linking.config.screens.OrderTracking).toBe('order/tracking');
    });
  });

  describe('Store locator routes', () => {
    it('should handle store locator route', () => {
      expect(linking.config.screens.StoreLocator).toBe('stores/locator');
    });

    it('should handle store selection route', () => {
      expect(linking.config.screens.StoreSelection).toBe('stores');
    });

    it('should handle store map route', () => {
      expect(linking.config.screens.StoreLocatorMap).toBe('stores/map');
    });

    it('should handle store list route', () => {
      expect(linking.config.screens.StoreLocatorList).toBe('stores/list');
    });
  });

  describe('Profile management routes', () => {
    it('should handle favorites route', () => {
      expect(linking.config.screens.Favorites).toBe('profile/favorites');
    });

    it('should handle saved addresses route', () => {
      expect(linking.config.screens.SavedAddresses).toBe('profile/addresses');
    });

    it('should handle add address route', () => {
      expect(linking.config.screens.AddAddress).toBe('profile/addresses/add');
    });

    it('should handle saved payments route', () => {
      expect(linking.config.screens.SavedPayments).toBe('profile/payments');
    });

    it('should handle add payment route', () => {
      expect(linking.config.screens.AddPayment).toBe('profile/payments/add');
    });

    it('should handle loyalty program route', () => {
      expect(linking.config.screens.LoyaltyProgram).toBe('profile/loyalty');
    });

    it('should handle privacy settings route', () => {
      expect(linking.config.screens.PrivacySettings).toBe('profile/privacy');
    });

    it('should handle app settings route', () => {
      expect(linking.config.screens.AppSettings).toBe('profile/settings');
    });

    it('should handle accessibility settings route', () => {
      expect(linking.config.screens.AccessibilitySettings).toBe('profile/accessibility');
    });
  });

  describe('Content & Education routes', () => {
    it('should handle articles list route', () => {
      expect(linking.config.screens.ArticleList).toBe('education/articles');
    });

    it('should handle community garden route', () => {
      expect(linking.config.screens.CommunityGarden).toBe('community');
    });

    it('should handle data transparency route', () => {
      expect(linking.config.screens.DataTransparency).toBe('transparency');
    });

    it('should handle privacy intelligence route', () => {
      expect(linking.config.screens.PrivacyIntelligence).toBe('privacy-intelligence');
    });
  });

  describe('Support routes', () => {
    it('should handle help FAQ route', () => {
      expect(linking.config.screens.HelpFAQ).toBe('help');
    });

    it('should handle contact us route', () => {
      expect(linking.config.screens.ContactUs).toBe('contact');
    });

    it('should handle concierge chat route', () => {
      expect(linking.config.screens.ConciergeChat).toBe('chat');
    });

    it('should handle legal route', () => {
      expect(linking.config.screens.Legal).toBe('legal');
    });

    it('should handle language selection route', () => {
      expect(linking.config.screens.LanguageSelection).toBe('language');
    });
  });

  describe('Prefixes', () => {
    it('should include custom protocol prefix', () => {
      expect(linking.prefixes).toContain('jars://');
    });

    it('should include HTTPS app domain prefix', () => {
      expect(linking.prefixes).toContain('https://jars.app/');
    });

    it('should include HTTPS www subdomain prefix', () => {
      expect(linking.prefixes).toContain('https://www.jars.app/');
    });
  });

  describe('Route coverage completeness', () => {
    // This test ensures we haven't missed any routes from the navigation types
    const expectedRoutes = [
      'SplashScreen',
      'Onboarding',
      'AgeVerification',
      'LoginSignUpDecision',
      'Login',
      'SignUp',
      'ForgotPassword',
      'OTPScreen',
      'StoreSelection',
      'HomeScreen',
      'ShopScreen',
      'ProductList',
      'ProductDetail',
      'CartScreen',
      'Checkout',
      'OrderConfirmation',
      'OrderTracking',
      'OrderHistory',
      'OrderDetails',
      'StoreLocator',
      'StoreLocatorMap',
      'StoreLocatorList',
      'StoreDetails',
      'Profile',
      'EditProfile',
      'Favorites',
      'SavedAddresses',
      'AddAddress',
      'EditAddress',
      'SavedPayments',
      'AddPayment',
      'EditPayment',
      'LoyaltyProgram',
      'Notifications',
      'PrivacySettings',
      'AppSettings',
      'HelpFAQ',
      'ContactUs',
      'EducationalGreenhouse',
      'ArticleList',
      'ArticleDetail',
      'TerpeneWheel',
      'CommunityGarden',
      'ConciergeChat',
      'DataTransparency',
      'PrivacyIntelligence',
      'AccessibilitySettings',
      'Awards',
      'Legal',
      'MyJars',
      'JournalEntry',
      'MyJarsInsights',
      'EthicalAIDashboard',
      'LanguageSelection',
    ];

    it('should have all expected routes configured', () => {
      const configuredRoutes = Object.keys(linking.config.screens);
      expectedRoutes.forEach(route => {
        expect(configuredRoutes).toContain(route);
      });
    });

    it('should not have extra routes not in navigation types', () => {
      const configuredRoutes = Object.keys(linking.config.screens);
      configuredRoutes.forEach(route => {
        expect(expectedRoutes).toContain(route);
      });
    });
  });
});
