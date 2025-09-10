import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import SavedPaymentsScreen from '../screens/SavedPaymentsScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import LoyaltyProgramScreen from '../screens/LoyaltyProgramDetailsScreen';
import NotificationsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import AccessibilitySettingsScreen from '../screens/AccessibilitySettingsScreen';
import MyJarsScreen from '../screens/MyJarsScreen';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import MyJarsInsightsScreen from '../screens/MyJarsInsightsScreen';

export type AccountStackParamList = {
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
  AccessibilitySettings: undefined;
  MyJars: undefined;
  JournalEntry: { item: import('../@types/jars').StashItem };
  MyJarsInsights: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      <Stack.Screen name="SavedPayments" component={SavedPaymentsScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
      <Stack.Screen name="EditPayment" component={EditPaymentScreen} />
      <Stack.Screen name="LoyaltyProgram" component={LoyaltyProgramScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
      <Stack.Screen name="MyJars" component={MyJarsScreen} />
      <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <Stack.Screen name="MyJarsInsights" component={MyJarsInsightsScreen} />
    </Stack.Navigator>
  );
}