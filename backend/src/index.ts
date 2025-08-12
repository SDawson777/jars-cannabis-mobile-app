import dotenv from 'dotenv';
dotenv.config(); // <-- MUST be called first!

// Ensure TS path aliases resolve at runtime after tsc build
import 'tsconfig-paths/register';

import * as Sentry from '@sentry/node';
import { initFirebase } from './firebaseAdmin';
try { initFirebase(); console.log('Firebase Admin initialized'); }
catch (e) { console.error('Firebase init skipped:', (e as Error).message); }
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { productsRouter } from './routes/products';
import { storesRouter } from './routes/stores';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { contentRouter } from './routes/content';
import { recommendationsRouter } from './routes/recommendations';
import { loyaltyRouter } from './routes/loyalty';
import { greenhouseRouter } from './routes/greenhouse';
import { journalRouter } from './routes/journal';
import { awardsRouter } from './routes/awards';
import { dataRouter } from './routes/data';
import { accessibilityRouter } from './routes/accessibility';
import { conciergeRouter } from './routes/concierge';
import { arRouter } from './routes/ar';
import { stripeRouter } from './routes/stripe';
import { reviewsRouter } from './routes/reviews';
import { preferencesRouter } from './routes/preferences';
import { webhookRouter } from './routes/webhooks';
import SentryInit from './utils/sentry'; // triggers Sentry.init()

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

app.get('/', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));
app.get('/sentry-debug', (_req, _res) => {
  throw new Error('Sentry test error!');
});

app.use('/api/v1', authRouter);
app.use('/api/v1', profileRouter);
app.use('/api/v1', productsRouter);
app.use('/api/v1', storesRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1', ordersRouter);
app.use('/api/v1', contentRouter);
app.use('/api/v1', recommendationsRouter);
app.use('/api/v1', loyaltyRouter);
app.use('/api/v1', greenhouseRouter);
app.use('/api/v1', journalRouter);
app.use('/api/v1', awardsRouter);
app.use('/api/v1', dataRouter);
app.use('/api/v1', accessibilityRouter);
app.use('/api/v1', conciergeRouter);
app.use('/api/v1', arRouter);
app.use('/api/v1', stripeRouter);
app.use('/api/v1/products', reviewsRouter);
app.use('/api/v1/profile', preferencesRouter);
app.use('/api/v1/webhook', webhookRouter);

// Type-safe Sentry error handler (always after all routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
