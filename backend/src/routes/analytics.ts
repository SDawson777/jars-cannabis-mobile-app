import { Router, Request, Response } from 'express';
import express from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { validateHMAC } from '../middleware/hmac';

export const analyticsRouter = Router();

// Rate limiting for analytics (per user)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

// Simple analytics endpoint that acts as a no-PII event sink
// Use express.raw to capture the raw bytes for HMAC validation, then parse JSON safely.
analyticsRouter.post(
  '/analytics/track',
  express.raw({ type: 'application/json' }),
  validateHMAC('analytics'),
  async (req: Request, res: Response) => {
    // If express.raw provided a Buffer in req.body, parse it; otherwise fallback to parsed body
    let parsedBody: any = {};
    try {
      if (req.body && Buffer.isBuffer(req.body)) {
        parsedBody = JSON.parse(req.body.toString('utf8'));
        // Also set rawBody for downstream middleware compatibility
        (req as any).rawBody = req.body.toString('utf8');
      } else parsedBody = req.body || {};
    } catch (_e) {
      logger.warn('[analytics] invalid json body');
      return res.status(400).json({ error: 'invalid_json' });
    }
    const { event, data = {} } = parsedBody || {};
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
  }
);

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
