// This file is a TypeScript configuration file for Expo
// @ts-nocheck
import type { ExpoConfig } from 'expo/config';
import fs from 'fs';
import path from 'path';

function resolveAndroidGoogleServicesFile(): string {
  // 1) If GOOGLE_SERVICES_JSON points to an existing file, use it
  const pathEnv = process.env.GOOGLE_SERVICES_JSON;
  if (pathEnv && fs.existsSync(pathEnv)) {
    return pathEnv;
  }

  // 2) If GOOGLE_SERVICES_JSON_BASE64 is provided, decode and write to a stable path
  const b64 = process.env.GOOGLE_SERVICES_JSON_BASE64;
  if (b64) {
    try {
      const projectRoot = process.cwd();
      const outDir = path.join(projectRoot, '.expo', 'secrets');
      const outFile = path.join(outDir, 'google-services.json');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
      return outFile;
    } catch (e) {
      // Fall through to default on any error
    }
  }

  // 3) Default to repo file if present
  const defaultPath = path.join(process.cwd(), 'apps', 'android', 'google-services.json');
  return defaultPath;
}

function resolveIOSGoogleServicesFile(): string {
  // 1) If GOOGLE_SERVICE_PLIST points to an existing file, use it
  const pathEnv = process.env.GOOGLE_SERVICE_PLIST;
  if (pathEnv && fs.existsSync(pathEnv)) {
    return pathEnv;
  }

  // 2) If GOOGLESERVICE_PLIST_BASE64 is provided, decode and write to a stable path
  const b64 = process.env.GOOGLESERVICE_PLIST_BASE64;
  if (b64) {
    try {
      const projectRoot = process.cwd();
      const outDir = path.join(projectRoot, '.expo', 'secrets');
      const outFile = path.join(outDir, 'GoogleService-Info.plist');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
      return outFile;
    } catch (e) {
      // Fall through to default on any error
    }
  }

  // 3) Default to repo file if present
  const defaultPath = path.join(process.cwd(), 'apps', 'ios', 'GoogleService-Info.plist');
  return defaultPath;
}

const config: ExpoConfig = {
  name: 'JARS',
  slug: 'jars-cannabis-mobile-app',
  // Manual app versioning (controlled instead of EAS autoIncrement)
  version: '1.0.0',
  extra: {
    eas: {
      projectId: 'f480819a-c0e4-430e-82bc-1a761385db05',
    },
  },
  ios: {
    bundleIdentifier: 'com.jarss.dev',
    // iOS build number should match or be incremented per release
    buildNumber: '1.0.0',
    // Firebase iOS config: path to GoogleService-Info.plist
    // Resolved from env var or base64 secret at build time, or fallback to repo file
    googleServicesFile: resolveIOSGoogleServicesFile(),
  },
  android: {
    package: 'com.jars.dev.android',
    // Increment versionCode with each release
    versionCode: 1,
    // Firebase Android config: path to google-services.json
    // Replace the placeholder file with the real one from Firebase when available
    googleServicesFile: resolveAndroidGoogleServicesFile(),
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
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 24,
          buildToolsVersion: '34.0.0',
        },
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
