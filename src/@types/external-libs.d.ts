declare module '@sentry/react-native' {
  export const init: (config: any) => void;
  export const wrap: <T extends React.ComponentType<any>>(component: T) => T;
  export const captureException: (error: any, context?: any) => void;
  export const captureMessage: (message: string) => void;
  export const addBreadcrumb: (breadcrumb: any) => void;
  export const setUser: (user: any) => void;
  export const setContext: (key: string, context: any) => void;
  export const setTag: (key: string, value: string) => void;
}

declare module '@stripe/stripe-react-native' {
  import React from 'react';

  export interface StripeProviderProps {
    publishableKey: string;
    merchantIdentifier?: string;
    children: React.ReactNode;
  }

  export const StripeProvider: React.ComponentType<StripeProviderProps>;
  export const useStripe: () => any;
  export const usePaymentSheet: () => any;
  export const useConfirmPayment: () => any;
  export const initStripe: (options: any) => Promise<void>;
}

declare module '@react-native-firebase/messaging' {
  export interface RemoteMessage {
    messageId?: string;
    messageType?: string;
    collapseKey?: string;
    data?: { [key: string]: string };
    from?: string;
    notification?: {
      title?: string;
      body?: string;
      android?: any;
      ios?: any;
    };
    sentTime?: number;
    ttl?: number;
  }

  export interface MessagingInstance {
    requestPermission: () => Promise<number>;
    getToken: () => Promise<string>;
    onMessage: (listener: (message: RemoteMessage) => void) => () => void;
    onNotificationOpenedApp: (listener: (message: RemoteMessage) => void) => () => void;
    getInitialNotification: () => Promise<RemoteMessage | null>;
    setBackgroundMessageHandler: (handler: (message: RemoteMessage) => Promise<void>) => void;
    AuthorizationStatus: {
      AUTHORIZED: number;
      DENIED: number;
      NOT_DETERMINED: number;
      PROVISIONAL: number;
    };
  }

  interface MessagingStatic {
    (): MessagingInstance;
    AuthorizationStatus: {
      AUTHORIZED: number;
      DENIED: number;
      NOT_DETERMINED: number;
      PROVISIONAL: number;
    };
  }

  declare const messaging: MessagingStatic;
  export default messaging;
}
