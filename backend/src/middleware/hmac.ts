/**
 * HMAC signature validation middleware for analytics and webhook endpoints
 *
 * Usage:
 *   router.post('/analytics/track', validateHMAC('analytics'), handler);
 *   router.post('/webhooks/stripe', validateHMAC('stripe'), handler);
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../env';
import { logger } from '../utils/logger';

interface HMACConfig {
  secret: string;
  header: string;
  algorithm: string;
}

const HMAC_CONFIGS: Record<string, HMACConfig> = {
  analytics: {
    secret: env.ANALYTICS_HMAC_SECRET || env.JWT_SECRET,
    header: 'x-analytics-signature',
    algorithm: 'sha256',
  },
  stripe: {
    secret: env.STRIPE_WEBHOOK_SECRET || '',
    header: 'stripe-signature',
    algorithm: 'sha256',
  },
  default: {
    secret: env.JWT_SECRET,
    header: 'x-signature',
    algorithm: 'sha256',
  },
};

export function validateHMAC(configKey: string = 'default') {
  return (req: Request, res: Response, next: NextFunction) => {
    const config = HMAC_CONFIGS[configKey] || HMAC_CONFIGS.default;

    if (!config.secret) {
      logger.warn('HMAC validation skipped: no secret configured', { configKey });
      return next();
    }

    const signature = req.headers[config.header] as string;
    if (!signature) {
      logger.warn('HMAC validation failed: missing signature header', {
        configKey,
        header: config.header,
      });
      return res.status(401).json({ error: 'Missing signature' });
    }

    try {
      // For Stripe, use their verification logic
      if (configKey === 'stripe' && signature.startsWith('t=')) {
        // Stripe signature format: t=timestamp,v1=signature
        // In production, use @stripe/stripe-js official verification
        // For now, basic validation placeholder
        return next();
      }

      // Standard HMAC validation
      // Prefer a rawBody set by upstream middleware; if not present, handle Buffer body (from express.raw)
      let rawBody: string;
      if ((req as any).rawBody) {
        rawBody = (req as any).rawBody;
      } else if (req.body && Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString('utf8');
      } else {
        rawBody = JSON.stringify(req.body);
      }
      const expectedSignature = crypto
        .createHmac(config.algorithm, config.secret)
        .update(rawBody)
        .digest('hex');

      const providedSignature = signature.replace(/^sha256=/, '');

      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
        logger.warn('HMAC validation failed: signature mismatch', { configKey });
        return res.status(401).json({ error: 'Invalid signature' });
      }

      next();
    } catch (err) {
      logger.error('HMAC validation error', { error: (err as Error).message, configKey });
      return res.status(500).json({ error: 'Signature validation error' });
    }
  };
}

/**
 * Middleware to capture raw body for HMAC validation
 * Must be applied before express.json()
 */
export function captureRawBody() {
  return (req: Request, res: Response, next: NextFunction) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  };
}
