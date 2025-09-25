// Analytics implementation - fallback when @aws-amplify/analytics is not available
import logger from '../lib/logger';
import { API_BASE_URL } from '../utils/apiConfig';

export function logEvent(name: string, data: Record<string, any>) {
  // In development, log to console via logger
  if (__DEV__) {
    logger.log(`Analytics Event: ${name}`, data);
  }

  // Also send to backend analytics endpoint (fire-and-forget)
  trackEventToBackend(name, data);
}

// Fire-and-forget analytics tracking to backend
async function trackEventToBackend(event: string, data: Record<string, any>) {
  try {
    // Don't block on this - just send the event
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, data }),
    }).catch(error => {
      // Silently fail - analytics shouldn't block the app
      if (__DEV__) {
        logger.log('Analytics tracking failed:', error);
      }
    });
  } catch (error) {
    // Silently fail - analytics shouldn't block the app
    if (__DEV__) {
      logger.log('Analytics tracking failed:', error);
    }
  }
}

export const trackEvent = logEvent;
