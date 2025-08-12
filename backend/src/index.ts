import 'dotenv/config';
import express from 'express';
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
import { storesRouter } from './routes/stores';
import { productsRouter } from './routes/products';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { contentRouter } from './routes/content';
import { loyaltyRouter } from './routes/loyalty';
import { journalRouter } from './routes/journal';
import { recommendationsRouter } from './routes/recommendations';
import { dataRouter } from './routes/data';
import { conciergeRouter } from './routes/concierge';
import { arRouter } from './routes/ar';
import { initFirebase } from './bootstrap/firebase-admin';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN?.split(',') as any) || '*' }));

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

try { initFirebase(); } catch (e) { console.log('Firebase init skipped:', (e as any)?.message); }

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));
app.get('/sentry-debug', (_req, _res) => {
  throw new Error('Sentry test error!');
});

app.use('/api/v1', authRouter);
app.use('/api/v1', profileRouter);
app.use('/api/v1', storesRouter);
app.use('/api/v1', productsRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1', ordersRouter);
app.use('/api/v1', contentRouter);
app.use('/api/v1', loyaltyRouter);
app.use('/api/v1', journalRouter);
app.use('/api/v1', recommendationsRouter);
app.use('/api/v1', dataRouter);
app.use('/api/v1', conciergeRouter);
app.use('/api/v1', arRouter);

// Global error handler so nothing crashes
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err?.code || err?.message || err);
  res.status(500).json({ error: 'Internal Server Error' });

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
app.listen(port, () => console.log(`🚀 Backend listening on http://localhost:${port}`));
