import { Router } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const analyticsRouter = Router();

// Rate limiting for analytics (per user)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

// Simple analytics endpoint that acts as a no-PII event sink
analyticsRouter.post('/analytics/track', async (req, res) => {
  const { event, data = {} } = req.body || {};
  // Accept user id from req.user (if present), x-user-id header, or fallback to IP
  const userId = (req as any).user?.id || req.headers['x-user-id'] || req.ip;
  const reqId = uuidv4();

  if (!event) {
    return res.status(400).json({ error: 'event name required' });
  }

  // --- Rate limiting: 100 events per minute per user ---
  const now = Date.now();
  const rlKey = String(userId);
  const rl = rateLimitMap.get(rlKey) || { count: 0, reset: now + 60_000 };

  if (now > rl.reset) {
    rl.count = 0;
    rl.reset = now + 60_000;
  }

  rl.count++;
  rateLimitMap.set(rlKey, rl);

  if (rl.count > 100) {
    const retryAfter = Math.ceil((rl.reset - now) / 1000);
    logger.debug('[analytics] rate limit hit', { reqId, userId, event, retryAfter });
    return res
      .status(429)
      .set('Retry-After', String(retryAfter))
      .json({ error: 'Too many requests', code: 'rate_limit', retryAfter });
  }

  try {
    // Log analytics event (no-PII) with userId and event payload
    const eventPayload = {
      reqId,
      userId,
      event,
      data: sanitizeData(data),
      timestamp: new Date().toISOString(),
    };

    logger.info('[analytics] event tracked', eventPayload);

    res.json({ success: true, eventId: reqId });
  } catch (e: any) {
    logger.error('[analytics] error', { reqId, userId, event, error: e.message });
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Sanitize data to ensure no PII is logged
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  const piiFields = ['email', 'phone', 'address', 'name', 'firstName', 'lastName', 'personalInfo'];

  // Remove potential PII fields
  for (const field of piiFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}
