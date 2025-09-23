import React from 'react';

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: undefined }),
    presentPaymentSheet: async () => ({ error: undefined }),
  } as any;
}

export function isPlatformPaySupported() {
  return Promise.resolve(false);
}

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
