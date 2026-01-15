// Analytics implementation with HMAC signing for backend validation
import * as Crypto from 'expo-crypto';
import logger from '../lib/logger';
import { API_BASE_URL } from '../utils/apiConfig';
import { fetchJson } from './apiClient';
import { getAuthToken } from './auth';

// HMAC secret - should match backend ANALYTICS_HMAC_SECRET or JWT_SECRET
const ANALYTICS_SECRET = process.env.EXPO_PUBLIC_ANALYTICS_SECRET || '';

// Event queue for batching
let eventQueue: Array<{ event: string; data: Record<string, any>; timestamp: string }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000; // 5 seconds

/**
 * Generate HMAC signature for analytics payload
 */
async function generateSignature(payload: string): Promise<string> {
  if (!ANALYTICS_SECRET) {
    return '';
  }
  
  try {
    // Use expo-crypto for HMAC-SHA256
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ANALYTICS_SECRET + payload
    );
    return digest;
  } catch (err) {
    logger.warn('Failed to generate analytics signature', { err });
    return '';
  }
}

/**
 * Log an analytics event - queued for batching
 */
export function logEvent(name: string, data: Record<string, any>) {
  // In development, log to console via logger
  if (__DEV__) {
    logger.log(`Analytics Event: ${name}`, data);
  }

  // Add to queue
  eventQueue.push({
    event: name,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
  });

  // Flush immediately if batch size reached
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  } else if (!flushTimer) {
    // Schedule flush
    flushTimer = setTimeout(() => {
      flushEvents();
    }, FLUSH_INTERVAL);
  }
}

/**
 * Sanitize data to remove PII before sending
 */
function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  
  // Remove common PII fields
  const piiFields = ['email', 'phone', 'password', 'ssn', 'address', 'creditCard', 'cardNumber'];
  piiFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
}

/**
 * Flush queued events to backend
 */
async function flushEvents() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue = [];

  try {
    const authToken = await getAuthToken();
    
    // Send events individually (backend expects single event per request)
    for (const evt of events) {
      const payload = JSON.stringify({ event: evt.event, data: evt.data, timestamp: evt.timestamp });
      const signature = await generateSignature(payload);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (signature) {
        headers['x-analytics-signature'] = signature;
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      fetchJson(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers,
        body: payload,
        retries: 0,
      }).catch(error => {
        // Silently fail - analytics shouldn't block the app
        if (__DEV__) {
          logger.log('Analytics tracking failed:', error);
        }
      });
    }
  } catch (error) {
    // Silently fail - analytics shouldn't block the app
    if (__DEV__) {
      logger.log('Analytics flush failed:', error);
    }
  }
}

/**
 * Track a content view event
 */
export function trackContentView(contentType: string, contentId: string, metadata?: Record<string, any>) {
  logEvent('content_view', {
    contentType,
    contentId,
    ...metadata,
  });
}

/**
 * Track a content click event
 */
export function trackContentClick(contentType: string, contentId: string, metadata?: Record<string, any>) {
  logEvent('content_click', {
    contentType,
    contentId,
    ...metadata,
  });
}

/**
 * Track a screen view event
 */
export function trackScreenView(screenName: string, metadata?: Record<string, any>) {
  logEvent('screen_view', {
    screenName,
    ...metadata,
  });
}

/**
 * Track a commerce event (add to cart, purchase, etc.)
 */
export function trackCommerceEvent(
  action: 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase' | 'view_item',
  productIdOrItems?: string | Array<{ product_id?: string; quantity?: number; price?: number }>,
  metadata?: Record<string, any>
) {
  const eventData: Record<string, any> = { ...metadata };
  
  if (typeof productIdOrItems === 'string') {
    eventData.productId = productIdOrItems;
  } else if (Array.isArray(productIdOrItems)) {
    eventData.items = productIdOrItems;
    eventData.item_count = productIdOrItems.length;
  }
  
  logEvent(`commerce_${action}`, eventData);
}

// Flush events on app background/close
export function flushAnalytics() {
  flushEvents();
}

export const trackEvent = logEvent;
