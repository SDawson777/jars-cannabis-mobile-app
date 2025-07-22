import * as Sentry from '@sentry/node';

// (Optional, but helps in debugging env issues)
if (!process.env.SENTRY_DSN) {
  // You can log a warning, but do not throw—just warn in non-prod/dev!
  console.warn('⚠️  SENTRY_DSN is not set. Errors will NOT be reported to Sentry.');
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust for performance monitoring, 1.0 = 100% (dev), 0.2 = 20% (prod)
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true, // Send user info/IP for better debugging. Remove if privacy is a concern.
});

export default Sentry;
