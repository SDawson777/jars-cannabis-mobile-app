import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import IDVerificationScreen from '../screens/IDVerificationScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';

export type CheckoutStackParamList = {
  CartScreen: undefined;
  Checkout: undefined;
  IDVerification: { returnTo?: string } | undefined;
  OrderConfirmation: undefined;
  OrderTracking: { status?: string };
  OrderHistory: undefined;
  OrderDetails: { order: any };
};

const Stack = createNativeStackNavigator<CheckoutStackParamList>();

export default function CheckoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="IDVerification" component={IDVerificationScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}
