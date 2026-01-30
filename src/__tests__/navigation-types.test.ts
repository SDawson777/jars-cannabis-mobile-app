import type { RootNavigatorParamList, RootStackParamList } from '../navigation/types';

describe('navigation types', () => {
  describe('RootNavigatorParamList', () => {
    it('defines OnboardingFlow with no params', () => {
      const params: RootNavigatorParamList['OnboardingFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines AuthFlow with no params', () => {
      const params: RootNavigatorParamList['AuthFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines HomeScreen with no params', () => {
      const params: RootNavigatorParamList['HomeScreen'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines ShopFlow with no params', () => {
      const params: RootNavigatorParamList['ShopFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines CheckoutFlow with no params', () => {
      const params: RootNavigatorParamList['CheckoutFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines AccountFlow with no params', () => {
      const params: RootNavigatorParamList['AccountFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('defines ContentFlow with no params', () => {
      const params: RootNavigatorParamList['ContentFlow'] = undefined;
      expect(params).toBeUndefined();
    });

    it('has all required navigation flows', () => {
      const flows: (keyof RootNavigatorParamList)[] = [
        'OnboardingFlow',
        'AuthFlow',
        'HomeScreen',
        'ShopFlow',
        'CheckoutFlow',
        'AccountFlow',
        'ContentFlow',
      ];

      expect(flows).toHaveLength(7);
    });
  });

  describe('RootStackParamList', () => {
    describe('screens with no params', () => {
      it('defines SplashScreen with no params', () => {
        const params: RootStackParamList['SplashScreen'] = undefined;
        expect(params).toBeUndefined();
      });

      it('defines Onboarding with no params', () => {
        const params: RootStackParamList['Onboarding'] = undefined;
        expect(params).toBeUndefined();
      });

      it('defines LoginSignUpDecision with no params', () => {
        const params: RootStackParamList['LoginSignUpDecision'] = undefined;
        expect(params).toBeUndefined();
      });

      it('defines Login with no params', () => {
        const params: RootStackParamList['Login'] = undefined;
        expect(params).toBeUndefined();
      });

      it('defines CartScreen with no params', () => {
        const params: RootStackParamList['CartScreen'] = undefined;
        expect(params).toBeUndefined();
      });

      it('defines Profile with no params', () => {
        const params: RootStackParamList['Profile'] = undefined;
        expect(params).toBeUndefined();
      });
    });

    describe('screens with required params', () => {
      it('defines ProductDetail with required slug param', () => {
        const params: RootStackParamList['ProductDetail'] = {
          slug: 'blue-dream',
        };

        expect(params.slug).toBe('blue-dream');
      });

      it('defines ArticleDetail with required slug param', () => {
        const params: RootStackParamList['ArticleDetail'] = {
          slug: 'cannabis-guide',
        };

        expect(params.slug).toBe('cannabis-guide');
      });

      it('defines QuizScreen with required articleSlug param', () => {
        const params: RootStackParamList['QuizScreen'] = {
          articleSlug: 'intro-to-cannabis',
        };

        expect(params.articleSlug).toBe('intro-to-cannabis');
      });

      it('defines EditAddress with required address param', () => {
        const params: RootStackParamList['EditAddress'] = {
          address: { id: '1', street: '123 Main St' },
        };

        expect(params.address.id).toBe('1');
      });

      it('defines EditPayment with required payment param', () => {
        const params: RootStackParamList['EditPayment'] = {
          payment: { id: '1', type: 'card' },
        };

        expect(params.payment.id).toBe('1');
      });

      it('defines OrderDetails with required order param', () => {
        const params: RootStackParamList['OrderDetails'] = {
          order: { id: 'order-123', total: 50.0 },
        };

        expect(params.order.id).toBe('order-123');
      });

      it('defines StoreDetails with required store param', () => {
        const params: RootStackParamList['StoreDetails'] = {
          store: { id: 'store-1', name: 'Main Store' },
        };

        expect(params.store.name).toBe('Main Store');
      });

      it('defines JournalEntry with required item param', () => {
        const params: RootStackParamList['JournalEntry'] = {
          item: {
            id: 'stash-1',
            name: 'Blue Dream',
            strainType: 'Hybrid',
            purchaseDate: '2026-01-20',
            status: 'in_stock',
          },
        };

        expect(params.item.name).toBe('Blue Dream');
      });
    });

    describe('screens with optional params', () => {
      it('defines IDVerification with optional returnTo param', () => {
        const withParam: RootStackParamList['IDVerification'] = {
          returnTo: 'Checkout',
        };

        const withoutParam: RootStackParamList['IDVerification'] = undefined;

        expect(withParam?.returnTo).toBe('Checkout');
        expect(withoutParam).toBeUndefined();
      });

      it('defines ShopScreen with optional weatherFilter param', () => {
        const withWeather: RootStackParamList['ShopScreen'] = {
          weatherFilter: 'sunny',
        };

        const withoutWeather: RootStackParamList['ShopScreen'] = undefined;

        expect(withWeather?.weatherFilter).toBe('sunny');
        expect(withoutWeather).toBeUndefined();
      });

      it('defines OrderTracking with optional status param', () => {
        const withStatus: RootStackParamList['OrderTracking'] = {
          status: 'shipped',
        };

        const withoutStatus: RootStackParamList['OrderTracking'] = {};

        expect(withStatus?.status).toBe('shipped');
        expect(withoutStatus.status).toBeUndefined();
      });

      it('defines EditProfile with optional profile param', () => {
        const withProfile: RootStackParamList['EditProfile'] = {
          profile: { name: 'John Doe', email: 'john@example.com' },
        };

        const withoutProfile: RootStackParamList['EditProfile'] = {};

        expect(withProfile?.profile.name).toBe('John Doe');
        expect(withoutProfile.profile).toBeUndefined();
      });

      it('defines JournalEntry with optional journalEntry param', () => {
        const params: RootStackParamList['JournalEntry'] = {
          item: {
            id: 'stash-1',
            name: 'Product',
            strainType: 'Sativa',
            purchaseDate: '2026-01-20',
            status: 'in_stock',
          },
          journalEntry: { id: 'entry-1', notes: 'Great experience' },
        };

        expect(params.journalEntry?.notes).toBe('Great experience');
      });
    });

    describe('screen categories', () => {
      it('has authentication screens', () => {
        const authScreens: (keyof RootStackParamList)[] = [
          'LoginSignUpDecision',
          'Login',
          'SignUp',
          'ForgotPassword',
          'OTPScreen',
        ];

        expect(authScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has shopping screens', () => {
        const shopScreens: (keyof RootStackParamList)[] = [
          'ShopScreen',
          'ProductList',
          'ProductDetail',
          'CartScreen',
        ];

        expect(shopScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has checkout screens', () => {
        const checkoutScreens: (keyof RootStackParamList)[] = [
          'Checkout',
          'OrderConfirmation',
          'OrderTracking',
        ];

        expect(checkoutScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has account screens', () => {
        const accountScreens: (keyof RootStackParamList)[] = [
          'Profile',
          'EditProfile',
          'Favorites',
          'SavedAddresses',
          'AddAddress',
          'EditAddress',
          'SavedPayments',
          'AddPayment',
          'EditPayment',
        ];

        expect(accountScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has content screens', () => {
        const contentScreens: (keyof RootStackParamList)[] = [
          'EducationalGreenhouse',
          'ArticleList',
          'ArticleDetail',
          'QuizScreen',
          'TerpeneWheel',
          'CommunityGarden',
        ];

        expect(contentScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has store locator screens', () => {
        const storeScreens: (keyof RootStackParamList)[] = [
          'StoreLocator',
          'StoreLocatorMap',
          'StoreLocatorList',
          'StoreDetails',
          'StoreSelection',
        ];

        expect(storeScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has settings screens', () => {
        const settingsScreens: (keyof RootStackParamList)[] = [
          'AppSettings',
          'PrivacySettings',
          'AccessibilitySettings',
          'LanguageSelection',
          'Notifications',
        ];

        expect(settingsScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has My Jars screens', () => {
        const jarsScreens: (keyof RootStackParamList)[] = [
          'MyJars',
          'JournalEntry',
          'MyJarsInsights',
        ];

        expect(jarsScreens.every(screen => screen !== undefined)).toBe(true);
      });

      it('has help and support screens', () => {
        const supportScreens: (keyof RootStackParamList)[] = [
          'HelpFAQ',
          'ContactUs',
          'ConciergeChat',
        ];

        expect(supportScreens.every(screen => screen !== undefined)).toBe(true);
      });
    });

    describe('special features', () => {
      it('includes ID verification screen', () => {
        const screen: keyof RootStackParamList = 'IDVerification';
        expect(screen).toBe('IDVerification');
      });

      it('includes loyalty program screen', () => {
        const screen: keyof RootStackParamList = 'LoyaltyProgram';
        expect(screen).toBe('LoyaltyProgram');
      });

      it('includes awards screen', () => {
        const screen: keyof RootStackParamList = 'Awards';
        expect(screen).toBe('Awards');
      });

      it('includes legal screen', () => {
        const screen: keyof RootStackParamList = 'Legal';
        expect(screen).toBe('Legal');
      });

      it('includes data transparency screen', () => {
        const screen: keyof RootStackParamList = 'DataTransparency';
        expect(screen).toBe('DataTransparency');
      });

      it('includes privacy intelligence screen', () => {
        const screen: keyof RootStackParamList = 'PrivacyIntelligence';
        expect(screen).toBe('PrivacyIntelligence');
      });

      it('includes ethical AI dashboard', () => {
        const screen: keyof RootStackParamList = 'EthicalAIDashboard';
        expect(screen).toBe('EthicalAIDashboard');
      });

      it('includes strain finder', () => {
        const screen: keyof RootStackParamList = 'StrainFinder';
        expect(screen).toBe('StrainFinder');
      });
    });
  });

  describe('type compatibility', () => {
    it('RootNavigatorParamList can be used for navigator typing', () => {
      type NavigatorType = RootNavigatorParamList;
      const flows: (keyof NavigatorType)[] = ['HomeScreen', 'ShopFlow'];
      expect(flows).toHaveLength(2);
    });

    it('RootStackParamList can be used for stack navigator typing', () => {
      type StackType = RootStackParamList;
      const screens: (keyof StackType)[] = ['Login', 'ProductDetail'];
      expect(screens).toHaveLength(2);
    });

    it('supports navigation with params', () => {
      const productParams: RootStackParamList['ProductDetail'] = {
        slug: 'test-product',
      };

      const articleParams: RootStackParamList['ArticleDetail'] = {
        slug: 'test-article',
      };

      expect(productParams.slug).toBeDefined();
      expect(articleParams.slug).toBeDefined();
    });

    it('supports optional params for undefined routes', () => {
      const homeParams: RootStackParamList['HomeScreen'] = undefined;
      const shopParams: RootStackParamList['ShopScreen'] = { weatherFilter: 'rainy' };

      expect(homeParams).toBeUndefined();
      expect(shopParams?.weatherFilter).toBe('rainy');
    });
  });
});
