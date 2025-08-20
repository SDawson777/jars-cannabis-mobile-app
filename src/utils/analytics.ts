// Analytics implementation - fallback when @aws-amplify/analytics is not available
export function logEvent(name: string, data: Record<string, any>) {
  // In development, log to console
  if (__DEV__) {
    console.log(`Analytics Event: ${name}`, data);
  }
  // In production, this would integrate with your analytics service
}

export const trackEvent = logEvent;
