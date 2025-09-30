/// <reference types="react" />
/// <reference types="react-native" />

// Global type overrides to prevent DOM/React Native conflicts
declare global {
  namespace JSX {
    interface IntrinsicElements {}
  }

  // Add fetch-related types that React Native should have
  interface RequestInit {
    method?: string;
    headers?: { [key: string]: string };
    body?: string;
  }

  interface Response {
    ok: boolean;
    status: number;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  function fetch(url: string, init?: RequestInit): Promise<Response>;
}

// Minimal ambient type declarations for packages that don't ship types or need augmentation

// 1. AsyncStorage - fallback typing if bundled types not found
declare module '@react-native-async-storage/async-storage' {
  export interface AsyncStorageStatic {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  }
  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}

// 2. NetInfo - minimal typing
declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
    isInternetReachable?: boolean | null;
    type: string;
  }
  export function addEventListener(listener: (state: NetInfoState) => void): { remove: () => void };
  export function fetch(): Promise<NetInfoState>;
  export function useNetInfo(): NetInfoState;
  const _default: { addEventListener: typeof addEventListener; fetch: typeof fetch };
  export default _default;
}

// 3. react-native-render-html - minimal typing
declare module 'react-native-render-html' {
  import * as React from 'react';
  interface RenderHTMLProps {
    source: { html?: string };
    contentWidth: number;
    baseStyle?: { [key: string]: any };
  }
  const RenderHTML: React.ComponentType<RenderHTMLProps>;
  export default RenderHTML;
}

// 4. Jest matcher augmentation for Detox/RTL
declare namespace jest {
  interface Matchers<R> {
    toBeVisible(): R;
  }
}

// 5. Asset imports
declare module '*.png' {
  const src: number;
  export default src;
}
declare module '*.jpg' {
  const src: number;
  export default src;
}
declare module '*.jpeg' {
  const src: number;
  export default src;
}
declare module '*.gif' {
  const src: number;
  export default src;
}
declare module '*.mp3' {
  const src: number;
  export default src;
}

// 6. React Native module overrides
declare module 'react-native-linear-gradient';
declare module 'react-native-sound';
declare module 'react-native-haptic-feedback';
declare module 'react-native-maps';
declare module 'lottie-react-native';
declare module 'react-native-pager-view';
declare module 'expo-secure-store';
declare module 'expo-speech';

// 7. Missing expo modules
declare module 'expo-modules-core' {
  export interface EventEmitter {}
  export interface PermissionResponse {
    status: string;
  }
  export interface PermissionStatus {}
  export interface PermissionHookOptions {}
  export interface Subscription {}
}

declare module 'expo-location' {
  export interface LocationPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
  }
  export const Accuracy: {
    High: number;
    Low: number;
    Balanced: number;
    Lowest: number;
    BestForNavigation: number;
  };
  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: any): Promise<{
    coords: {
      latitude: number;
      longitude: number;
    };
  }>;
}

// 8. Third-party libraries without types
declare module 'bunyan' {
  export interface Serializer {}
}

declare module '@react-native/assets-registry/registry' {
  export interface PackagerAsset {}
}
