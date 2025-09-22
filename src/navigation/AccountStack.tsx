import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AccessibilitySettingsScreen from '../screens/AccessibilitySettingsScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import LoyaltyProgramScreen from '../screens/LoyaltyProgramDetailsScreen';
import MyJarsInsightsScreen from '../screens/MyJarsInsightsScreen';
import MyJarsScreen from '../screens/MyJarsScreen';
import NotificationsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import SavedPaymentsScreen from '../screens/SavedPaymentsScreen';

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
