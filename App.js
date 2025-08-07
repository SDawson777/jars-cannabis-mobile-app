// src/App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// normal import (no `import type`)
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider } from './src/context/ThemeContext';
import { LoyaltyProvider } from './src/context/LoyaltyContext';
import { StoreProvider } from './src/context/StoreContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { CMSPreviewProvider } from './src/context/CMSPreviewContext';
import OfflineNotice from './src/components/OfflineNotice';
import * as SecureStore from 'expo-secure-store';
import { StripeProvider } from '@stripe/stripe-react-native';

import SplashScreenWrapper from './src/screens/SplashScreenWrapper';
import OnboardingPager from './src/screens/OnboardingPager';
import AgeVerification from './src/screens/AgeVerification';
import LoginSignUpDecisionScreen from './src/screens/LoginSignUpDecisionScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import OTPScreen from './src/screens/OTPScreen';
import StoreSelection from './src/screens/StoreSelectionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import OrderHistoryScreen from './src/screens/orders/OrderHistoryScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import StoreLocatorScreen from './src/screens/StoreLocatorScreen';
import StoreLocatorMapScreen from './src/screens/StoreLocatorMapScreen';
import StoreLocatorListScreen from './src/screens/StoreLocatorListScreen';
import StoreDetailsScreen from './src/screens/StoreDetailsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SavedAddressesScreen from './src/screens/SavedAddressesScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import EditAddressScreen from './src/screens/EditAddressScreen';
import SavedPaymentsScreen from './src/screens/SavedPaymentsScreen';
import AddPaymentScreen from './src/screens/AddPaymentScreen';
import EditPaymentScreen from './src/screens/EditPaymentScreen';
import LoyaltyProgramDetailsScreen from './src/screens/LoyaltyProgramDetailsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import HelpFAQScreen from './src/screens/HelpFAQScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import EducationalGreenhouseScreen from './src/screens/EducationalGreenhouseScreen';
import ArticleListScreen from './src/screens/ArticleListScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import CommunityGardenScreen from './src/screens/CommunityGardenScreen';
import ConciergeChatScreen from './src/screens/ConciergeChatScreen';
import DataTransparencyScreen from './src/screens/DataTransparencyScreen';
import PrivacyIntelligenceScreen from './src/screens/PrivacyIntelligenceScreen';
import AccessibilitySettingsScreen from './src/screens/AccessibilitySettingsScreen';
import AwardsScreen from './src/screens/AwardsScreen';
import LegalScreen from './src/screens/LegalScreen';
import MyJarsScreen from './src/screens/MyJarsScreen';
import JournalEntryScreen from './src/screens/JournalEntryScreen';
import MyJarsInsightsScreen from './src/screens/MyJarsInsightsScreen';
import EthicalAIDashboardScreen from './src/screens/EthicalAIDashboardScreen';

const Stack = createNativeStackNavigator(); // no generic
const queryClient = new QueryClient();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('SplashScreen');

  useEffect(() => {
    const checkFlag = async () => {
      const flag = await SecureStore.getItemAsync('onboardingComplete');
      setInitialRoute(flag ? 'AgeVerification' : 'SplashScreen');
    };
    checkFlag();
  }, []);

  if (!initialRoute) return null;

  return (
    <StripeProvider
      publishableKey={process.env.STRIPE_PUBLISHABLE_KEY || ''}
      merchantIdentifier={process.env.STRIPE_MERCHANT_ID || 'merchant.com.placeholder'}
    >
      <StoreProvider>
        <LoyaltyProvider>
          <ThemeProvider>
            <SettingsProvider>
              <CMSPreviewProvider>
                <QueryClientProvider client={queryClient}>
                  <OfflineNotice />
                  <NavigationContainer>
                    <Stack.Navigator
                      initialRouteName={initialRoute}
                      screenOptions={{ headerShown: false }}
                    >
                      <Stack.Screen name="SplashScreen" component={SplashScreenWrapper} />
                      <Stack.Screen name="Onboarding" component={OnboardingPager} />
                      <Stack.Screen name="AgeVerification" component={AgeVerification} />
                      <Stack.Screen
                        name="LoginSignUpDecision"
                        component={LoginSignUpDecisionScreen}
                      />
                      <Stack.Screen name="Login" component={LoginScreen} />
                      <Stack.Screen name="SignUp" component={SignUpScreen} />
                      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                      <Stack.Screen name="OTPScreen" component={OTPScreen} />
                      <Stack.Screen name="StoreSelection" component={StoreSelection} />
                      <Stack.Screen name="HomeScreen" component={HomeScreen} />
                      <Stack.Screen name="ShopScreen" component={ShopScreen} />
                      <Stack.Screen name="ProductList" component={ProductListScreen} />
                      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                      <Stack.Screen name="CartScreen" component={CartScreen} />
                      <Stack.Screen name="Checkout" component={CheckoutScreen} />
                      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
                      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                      <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
                      <Stack.Screen name="StoreLocatorMap" component={StoreLocatorMapScreen} />
                      <Stack.Screen name="StoreLocatorList" component={StoreLocatorListScreen} />
                      <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
                      <Stack.Screen name="Profile" component={ProfileScreen} />
                      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                      <Stack.Screen name="Favorites" component={FavoritesScreen} />
                      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
                      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
                      <Stack.Screen name="SavedPayments" component={SavedPaymentsScreen} />
                      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
                      <Stack.Screen name="EditPayment" component={EditPaymentScreen} />
                      <Stack.Screen name="LoyaltyProgram" component={LoyaltyProgramDetailsScreen} />
                      <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
                      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
                      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
                      <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
                      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
                      <Stack.Screen
                        name="EducationalGreenhouse"
                        component={EducationalGreenhouseScreen}
                      />
                      <Stack.Screen name="ArticleList" component={ArticleListScreen} />
                      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
                      <Stack.Screen name="CommunityGarden" component={CommunityGardenScreen} />
                      <Stack.Screen name="ConciergeChat" component={ConciergeChatScreen} />
                      <Stack.Screen name="DataTransparency" component={DataTransparencyScreen} />
                      <Stack.Screen
                        name="PrivacyIntelligence"
                        component={PrivacyIntelligenceScreen}
                      />
                      <Stack.Screen
                        name="AccessibilitySettings"
                        component={AccessibilitySettingsScreen}
                      />
                      <Stack.Screen name="Awards" component={AwardsScreen} />
                      <Stack.Screen name="Legal" component={LegalScreen} />
                      <Stack.Screen name="MyJars" component={MyJarsScreen} />
                      <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
                      <Stack.Screen name="MyJarsInsights" component={MyJarsInsightsScreen} />
                      <Stack.Screen
                        name="EthicalAIDashboard"
                        component={EthicalAIDashboardScreen}
                      />
                    </Stack.Navigator>
                  </NavigationContainer>
                </QueryClientProvider>
              </CMSPreviewProvider>
            </SettingsProvider>
          </ThemeProvider>
        </LoyaltyProvider>
      </StoreProvider>
    </StripeProvider>
  );
}
