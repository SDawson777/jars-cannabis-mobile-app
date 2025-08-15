// src/App.js
import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import messaging from '@react-native-firebase/messaging';
// normal import (no `import type`)
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider } from './src/context/ThemeContext';
import { LoyaltyProvider } from './src/context/LoyaltyContext';
import { StoreProvider } from './src/context/StoreContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { CMSPreviewProvider } from './src/context/CMSPreviewContext';
import OfflineNotice from './src/components/OfflineNotice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import ErrorBoundary from './src/components/ErrorBoundary';
import { getAuthToken } from './src/utils/auth';
import { API_BASE_URL } from './src/utils/apiConfig';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableAutoSessionTracking: true,
  enableNative: true,
  tracesSampleRate: 1.0,
  environment: __DEV__ ? 'development' : 'production',
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

const TOKEN_SYNC_KEY = 'pendingFcmToken';

const syncTokenToBackend = async (token: string, attempt = 0): Promise<void> => {
  const baseUrl = API_BASE_URL;
  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${baseUrl}/profile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    await AsyncStorage.removeItem(TOKEN_SYNC_KEY);
  } catch (err) {
    console.error('Sync token to backend failed:', err);
    await AsyncStorage.setItem(TOKEN_SYNC_KEY, token);
    const delay = Math.min(2 ** attempt * 1000, 60000);
    setTimeout(() => {
      syncTokenToBackend(token, attempt + 1);
    }, delay);
  }
};

import SplashScreenWrapper from './src/screens/SplashScreenWrapper';
import OnboardingPager from './src/screens/OnboardingPager';
import AgeVerificationScreen from './src/screens/onboarding/AgeVerificationScreen';
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
import LegalScreen from './src/screens/profile/LegalScreen';
import MyJarsScreen from './src/screens/MyJarsScreen';
import JournalEntryScreen from './src/screens/JournalEntryScreen';
import MyJarsInsightsScreen from './src/screens/MyJarsInsightsScreen';
import EthicalAIDashboardScreen from './src/screens/EthicalAIDashboardScreen';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';

const Stack = createNativeStackNavigator(); // no generic
const queryClient = new QueryClient();

function App() {
  const [initialRoute, setInitialRoute] = useState('SplashScreen');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      const verified = await AsyncStorage.getItem('ageVerified');
      setInitialRoute(verified === 'true' ? 'SplashScreen' : 'AgeVerification');
    };
    checkFlag();
  }, []);

  useEffect(() => {
    const resendPending = async () => {
      const pending = await AsyncStorage.getItem(TOKEN_SYNC_KEY);
      if (pending) {
        await syncTokenToBackend(pending);
      }
    };
    resendPending();
  }, []);

  useEffect(() => {
    const initMessaging = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        await syncTokenToBackend(token);
      } else {
        setNotificationsEnabled(false);
        Alert.alert('Notifications Disabled', 'Push notifications are turned off.', [
          { text: 'OK' },
        ]);
      }

      const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        const { title, body } = remoteMessage.notification || {};
        Alert.alert(title || 'Notification', body, [
          { text: 'OK' },
        ]);
      });

      const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app:', remoteMessage.notification);
      });

      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage) {
        console.log('App opened from quit state:', initialMessage.notification);
      }

      return () => {
        unsubscribeOnMessage();
        unsubscribeOnNotificationOpened();
      };
    };

    initMessaging();
  }, []);

  if (!initialRoute) return null;

  return (
    <ErrorBoundary>
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
                    {!notificationsEnabled && (
                      <View
                        accessible
                        accessibilityLabel="notifications-disabled"
                        style={{ padding: 8 }}
                      >
                        <Text>Push notifications are disabled.</Text>
                      </View>
                    )}
                    <NavigationContainer>
                      <Stack.Navigator
                        initialRouteName={initialRoute}
                        screenOptions={{ headerShown: false }}
                      >
                        <Stack.Screen name="SplashScreen" component={SplashScreenWrapper} />
                        <Stack.Screen name="Onboarding" component={OnboardingPager} />
                        <Stack.Screen name="AgeVerification" component={AgeVerificationScreen} />
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
                        <Stack.Screen
                          name="OrderConfirmation"
                          component={OrderConfirmationScreen}
                        />
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
                        <Stack.Screen
                          name="LoyaltyProgram"
                          component={LoyaltyProgramDetailsScreen}
                        />
                        <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
                        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
                        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
                        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
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
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);
