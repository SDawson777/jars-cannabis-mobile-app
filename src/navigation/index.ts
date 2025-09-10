export const linking = {
  prefixes: ['jars://', 'https://jars.app/', 'https://www.jars.app/'],
  config: {
    screens: {
      // Onboarding & Auth flows
      SplashScreen: '',
      Onboarding: 'onboarding',
      AgeVerification: 'age-verification',
      LoginSignUpDecision: 'auth',
      Login: 'auth/login',
      SignUp: 'auth/signup',
      ForgotPassword: 'auth/forgot-password',
      OTPScreen: 'auth/verify',

      // Store Selection & Home
      StoreSelection: 'stores',
      HomeScreen: 'home',

      // Shop flows
      ShopScreen: 'shop',
      ProductList: 'shop/products',
      ProductDetail: 'shop/product/:slug',

      // Cart & Checkout flows
      CartScreen: 'cart',
      Checkout: 'checkout',
      OrderConfirmation: 'order/confirmation',
      OrderTracking: 'order/tracking',
      OrderHistory: 'orders',
      OrderDetails: 'order/:orderId',

      // Store Locator flows
      StoreLocator: 'stores/locator',
      StoreLocatorMap: 'stores/map',
      StoreLocatorList: 'stores/list',
      StoreDetails: 'store/:storeId',

      // Profile & Account flows
      Profile: 'profile',
      EditProfile: 'profile/edit',
      Favorites: 'profile/favorites',
      SavedAddresses: 'profile/addresses',
      AddAddress: 'profile/addresses/add',
      EditAddress: 'profile/addresses/edit/:addressId',
      SavedPayments: 'profile/payments',
      AddPayment: 'profile/payments/add',
      EditPayment: 'profile/payments/edit/:paymentId',
      LoyaltyProgram: 'profile/loyalty',
      Notifications: 'profile/notifications',
      PrivacySettings: 'profile/privacy',
      AppSettings: 'profile/settings',
      AccessibilitySettings: 'profile/accessibility',

      // Educational & Content flows
      EducationalGreenhouse: 'education',
      ArticleList: 'education/articles',
      ArticleDetail: 'education/article/:slug',
      TerpeneWheel: 'education/terpenes',
      CommunityGarden: 'community',
      DataTransparency: 'transparency',
      PrivacyIntelligence: 'privacy-intelligence',

      // JARS specific flows
      MyJars: 'jars',
      JournalEntry: 'jars/journal/:itemId',
      MyJarsInsights: 'jars/insights',
      Awards: 'awards',
      EthicalAIDashboard: 'ethical-ai',

      // Support & Help
      HelpFAQ: 'help',
      ContactUs: 'contact',
      ConciergeChat: 'chat',
      Legal: 'legal',
      LanguageSelection: 'language',
    },
  },
};

// Export RootNavigator
export { default as RootNavigator } from './RootNavigator';
