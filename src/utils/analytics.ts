import type { FirebaseAnalyticsTypes } from '@react-native-firebase/analytics';
let analyticsInstance: FirebaseAnalyticsTypes.Module | null = null;

try {
  const analytics = require('@react-native-firebase/analytics').default;
  analyticsInstance = analytics();
} catch {
  analyticsInstance = null;
}

export async function trackEvent(event: string, params?: Record<string, any>) {
  try {
    if (analyticsInstance?.logEvent) {
      await analyticsInstance.logEvent(event, params);
    }
  } catch (err) {
    console.warn('trackEvent failed', err);
  }
}
