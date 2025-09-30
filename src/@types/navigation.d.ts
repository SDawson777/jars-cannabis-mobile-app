declare module '@react-navigation/native' {
  import { ComponentType } from 'react';
  export const NavigationContainer: ComponentType<any>;
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  export function useFocusEffect(callback: () => void): void;
  export type RouteProp<T = any, K = any> = any;
}

declare module '@react-navigation/native-stack' {
  import { ComponentType } from 'react';
  export const createNativeStackNavigator: <T = any>() => any;
  export type NativeStackNavigationProp<T = any, K = any> = any;
}

declare module '@react-navigation/stack' {
  import { ComponentType } from 'react';
  export const createStackNavigator: <T = any>() => any;
}
