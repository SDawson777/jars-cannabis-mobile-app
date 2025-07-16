// src/navigation/types.ts

/**
 * Define the full stack param list for your navigation.
 * Adjust the `any` types below to your real interfaces as needed.
 */
export type RootStackParamList = {
  SplashScreen: undefined;
  Onboarding: undefined;
  AgeVerification: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  StoreSelection: undefined;
  HomeScreen: undefined;
  ShopScreen: undefined;
  ProductDetails: { product: any };
  CartScreen: undefined;
  Checkout: undefined;
  OrderConfirmation: undefined;
  OrderTracking: { status?: string };
  OrderHistory: undefined;
  OrderDetails: { order: any };
  StoreLocator: undefined;
  StoreDetails: { store: any };
  Profile: undefined;
  EditProfile: { profile?: any };
  Favorites: undefined;
  SavedAddresses: undefined;
  AddAddress: undefined;
  EditAddress: { address: any };
  SavedPayments: undefined;
  AddPayment: undefined;
  EditPayment: { payment: any };
  LoyaltyProgram: undefined;
  Notifications: undefined;
  PrivacySettings: undefined;
  AppSettings: undefined;
  HelpFAQ: undefined;
  ContactUs: undefined;
  EducationalGreenhouse: undefined;
  ArticleDetail: { title: string };
  CommunityGarden: undefined;
  ConciergeChat: undefined;
  DataTransparency: undefined;
  AccessibilitySettings: undefined;
  Awards: undefined;
};
