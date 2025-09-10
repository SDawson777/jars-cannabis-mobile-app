import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ShopScreen from '../screens/ShopScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import StoreLocatorScreen from '../screens/StoreLocatorScreen';
import StoreLocatorMapScreen from '../screens/StoreLocatorMapScreen';
import StoreLocatorListScreen from '../screens/StoreLocatorListScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';

export type ShopStackParamList = {
  ShopScreen: undefined;
  ProductList: undefined;
  ProductDetail: { slug: string };
  StoreLocator: undefined;
  StoreLocatorMap: undefined;
  StoreLocatorList: undefined;
  StoreDetails: { store: any };
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export default function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
      <Stack.Screen name="StoreLocatorMap" component={StoreLocatorMapScreen} />
      <Stack.Screen name="StoreLocatorList" component={StoreLocatorListScreen} />
      <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
    </Stack.Navigator>
  );
}