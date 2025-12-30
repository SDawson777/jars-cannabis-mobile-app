import { Request, Response, NextFunction } from 'express';
import * as SentryNode from '@sentry/node';
import { logger } from '../utils/logger';

// Centralized error handler: normalizes common error shapes, logs, and reports to Sentry.
export default function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const correlationId = (req as any)?.requestId;
  const message = err?.message || 'internal_error';

  try {
    logger.error('unhandled.error', { error: message, stack: err?.stack, correlationId });
  } catch (_e) {
    // swallow logging errors
  }

  try {
    if (SentryNode && typeof SentryNode.captureException === 'function') {
      SentryNode.captureException(err);
    }
  } catch (_e) {
    // ignore Sentry failures
  }

  // If the error already has a status, use it. Otherwise default to 500.
  const status = err?.status || err?.statusCode || 500;
  // Keep the original correlationId in the response for tracing
  res.status(status).json({ error: message, correlationId });
}
