import type { Request, Response, NextFunction } from 'express';

interface RateBucket { count: number; first: number }
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const rateMap = new Map<string, RateBucket>();

function key(ip: string, route: string, token?: string) {
  return `${ip}|${route}|${token || 'anon'}`;
}

export function rateLimit(routeId: string, max = 60, windowMs = RATE_LIMIT_WINDOW_MS) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.ip || (req as any).connection?.remoteAddress || 'unknown').replace(
      '::ffff:',
      ''
    );
    const auth = req.headers['authorization'];
    const tokenPart = typeof auth === 'string' && auth.startsWith('Bearer ')
      ? auth.slice(7)
      : undefined;
    const k = key(ip, routeId, tokenPart);
    const now = Date.now();
    let bucket = rateMap.get(k);
    if (!bucket || now - bucket.first > windowMs) {
      bucket = { count: 0, first: now };
      rateMap.set(k, bucket);
    }
    bucket.count++;
    if (bucket.count > max) {
      return res.status(429).json({ error: 'rate_limited', retryAfterMs: windowMs });
    }
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    return next();
  };
}

// For tests to reset state if needed
export function _rateLimitReset() { rateMap.clear(); }
