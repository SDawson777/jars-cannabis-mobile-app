// src/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// normal import (no `import type`)
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider } from './src/context/ThemeContext';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AgeVerification from './src/screens/AgeVerification';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import StoreSelection from './src/screens/StoreSelection';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import StoreLocatorScreen from './src/screens/StoreLocatorScreen';
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
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import CommunityGardenScreen from './src/screens/CommunityGardenScreen';
import ConciergeChatScreen from './src/screens/ConciergeChatScreen';
import DataTransparencyScreen from './src/screens/DataTransparencyScreen';
import AccessibilitySettingsScreen from './src/screens/AccessibilitySettingsScreen';
import AwardsScreen from './src/screens/AwardsScreen';
import LegalScreen from './src/screens/LegalScreen';

const Stack = createNativeStackNavigator(); // no generic
const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
            {/* ...all previous screens... */}
            <Stack.Screen name="DataTransparency" component={DataTransparencyScreen} />
            <Stack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
            <Stack.Screen name="Awards" component={AwardsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
