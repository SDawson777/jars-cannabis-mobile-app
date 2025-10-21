// This file is a TypeScript configuration file for Expo
// @ts-nocheck
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'JARS',
  slug: 'jars-cannabis-mobile-app',
  extra: {
    eas: {
      projectId: 'f480819a-c0e4-430e-82bc-1a761385db05',
    },
  },
  ios: {
    bundleIdentifier: 'com.jarss.dev',
    // Firebase iOS config: path to GoogleService-Info.plist
    // Replace the placeholder file with the real one from Firebase when available
    googleServicesFile: './apps/ios/GoogleService-Info.plist',
  },
  android: {
    package: 'com.jars.dev.android',
    // Firebase Android config: path to google-services.json
    // Replace the placeholder file with the real one from Firebase when available
    googleServicesFile: './apps/android/google-services.json',
  },
  splash: {
    backgroundColor: '#F9F9F9',
    // Use a known-good PNG from assets/textures to avoid prebuild CRC errors
    image: './assets/textures/paper_noise_tile.png',
    resizeMode: 'contain',
  },
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.placeholder',
        enableGooglePay: true,
      },
    ],
  ],
  web: {
    bundler: 'webpack',
  },
  // Comprehensive deep linking configuration
  scheme: 'jars',
  platforms: ['ios', 'android', 'web'],
  // Enhanced linking configuration covering all app flows
  linking: {
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
  },
};

export default config;
