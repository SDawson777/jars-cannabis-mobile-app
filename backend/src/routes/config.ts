// backend/src/routes/config.ts
// Configuration and feature flags endpoint

import { Router, Request, Response } from 'express';

export const configRouter = Router();

/**
 * Feature flag configuration
 * These can be updated via CMS/admin panel in production
 */
const featureFlags = {
  enableCtaPulseAnimation: true,
  enableEnhancedHaptics: true,
  enableTerpeneAnimations: false,
  enableVoiceSearch: false,
  enableARPreview: false,
  enableSocialSharing: true,
  enableLoyaltyProgram: true,
  enableDeliveryTracking: true,
};

/**
 * GET /config/feature-flags
 * Returns current feature flag configuration
 */
configRouter.get('/config/feature-flags', (_req: Request, res: Response) => {
  res.json(featureFlags);
});

/**
 * GET /config/app
 * Returns general app configuration
 */
configRouter.get('/config/app', (_req: Request, res: Response) => {
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    minSupportedVersion: '1.0.0',
    maintenanceMode: false,
    features: featureFlags,
    links: {
      termsOfService: 'https://nimbus.cannabis/terms',
      privacyPolicy: 'https://nimbus.cannabis/privacy',
      support: 'https://nimbus.cannabis/support',
    },
    social: {
      instagram: 'https://instagram.com/nimbuscannabis',
      twitter: 'https://twitter.com/nimbuscannabis',
    },
  });
});

/**
 * GET /config/services
 * Returns availability status of external services
 * Mobile app uses this to enable/disable features based on backend configuration
 */
configRouter.get('/config/services', (_req: Request, res: Response) => {
  // Check which services are configured
  const stripeConfigured = !!(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 10
  );
  const openaiConfigured = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10);
  const firebaseConfigured = !!(
    process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  const databaseConfigured = !!process.env.DATABASE_URL;

  res.json({
    services: {
      stripe: {
        available: stripeConfigured,
        message: stripeConfigured ? null : 'Payment processing is currently unavailable',
      },
      ai: {
        available: openaiConfigured,
        message: openaiConfigured ? null : 'AI features are temporarily unavailable',
      },
      firebase: {
        available: firebaseConfigured,
        message: firebaseConfigured ? null : 'Push notifications may be limited',
      },
      database: {
        available: databaseConfigured,
        message: databaseConfigured ? null : 'Some features may be limited',
      },
    },
    // Overall payment capability
    paymentsEnabled: stripeConfigured,
    // Overall AI capability
    aiEnabled: openaiConfigured,
  });
});
