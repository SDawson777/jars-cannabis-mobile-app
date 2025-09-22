import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HomeScreen from '../screens/HomeScreen';

import AccountStack from './AccountStack';
import AuthStack from './AuthStack';
import CheckoutStack from './CheckoutStack';
import ContentStack from './ContentStack';
import OnboardingStack from './OnboardingStack';
import ShopStack from './ShopStack';

export type RootNavigatorParamList = {
  OnboardingFlow: undefined;
  AuthFlow: undefined;
  HomeScreen: undefined;
  ShopFlow: undefined;
  CheckoutFlow: undefined;
  AccountFlow: undefined;
  ContentFlow: undefined;
};

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Onboarding and initial setup flow */}
      <Stack.Screen name="OnboardingFlow" component={OnboardingStack} />

      {/* Authentication flow */}
      <Stack.Screen name="AuthFlow" component={AuthStack} />

      {/* Main home screen */}
      <Stack.Screen name="HomeScreen" component={HomeScreen} />

      {/* Shopping and product discovery flow */}
      <Stack.Screen name="ShopFlow" component={ShopStack} />

      {/* Cart, checkout and order management flow */}
      <Stack.Screen name="CheckoutFlow" component={CheckoutStack} />

      {/* Account management and profile flow */}
      <Stack.Screen name="AccountFlow" component={AccountStack} />

      {/* Educational content, help and community flow */}
      <Stack.Screen name="ContentFlow" component={ContentStack} />
    </Stack.Navigator>
  );
}
