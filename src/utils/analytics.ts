// Analytics implementation - fallback when @aws-amplify/analytics is not available
import logger from '../lib/logger';

export function logEvent(name: string, data: Record<string, any>) {
  // In development, log to console via logger
  if (__DEV__) {
    logger.log(`Analytics Event: ${name}`, data);
  }
  // In production, this would integrate with your analytics service
}

export const trackEvent = logEvent;
