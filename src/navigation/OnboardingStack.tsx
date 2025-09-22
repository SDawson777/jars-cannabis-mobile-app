import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import LoginSignUpDecisionScreen from '../screens/LoginSignUpDecisionScreen';
import OTPScreen from '../screens/OTPScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen from '../screens/SplashScreen';
import StoreSelectionScreen from '../screens/StoreSelectionScreen';
import AgeVerificationScreen from '../screens/onboarding/AgeVerificationScreen';

export type OnboardingStackParamList = {
  SplashScreen: undefined;
  Onboarding: undefined;
  AgeVerification: undefined;
  LoginSignUpDecision: undefined;
  OTPScreen: undefined;
  StoreSelection: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AgeVerification" component={AgeVerificationScreen} />
      <Stack.Screen name="LoginSignUpDecision" component={LoginSignUpDecisionScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="StoreSelection" component={StoreSelectionScreen} />
    </Stack.Navigator>
  );
}
