

import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { initFirebase } from './bootstrap/firebase-admin';
import { arRouter } from './routes/ar';
import { authRouter } from './routes/auth';
import { cartRouter } from './routes/cart';
import { conciergeRouter } from './routes/concierge';
import { contentRouter } from './routes/content';
import { dataRouter } from './routes/data';
import { homeRouter } from './routes/home';
import { journalRouter } from './routes/journal';
import { loyaltyRouter } from './routes/loyalty';
import { ordersRouter } from './routes/orders';
import { productsRouter } from './routes/products';
import { profileRouter } from './routes/profile';
import { qaRouter } from './routes/qa';
import { recommendationsRouter } from './routes/recommendations';
import { personalizationRouter } from './routes/personalization';
import { awardsApiRouter } from './routes/awardsApi';
import { stripeRouter } from './routes/stripe';
import { paymentMethodsRouter } from './routes/paymentMethods';
import { addressesRouter } from './routes/addresses';
import { storesRouter } from './routes/stores';
import { phase4Router } from './routes/phase4';
import { logger } from './utils/logger';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN?.split(',') as any) || '*' }));

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

try { initFirebase(); } catch (e) {
  logger.debug('Firebase init skipped:', (e as any)?.message);
}

// Register routers under both /api and /api/v1 for compatibility with tests and older clients
const routers = [
  authRouter,
  profileRouter,
  paymentMethodsRouter,
  addressesRouter,
  storesRouter,
  productsRouter,
  cartRouter,
  ordersRouter,
  contentRouter,
  loyaltyRouter,
  journalRouter,
  recommendationsRouter,
  dataRouter,
  conciergeRouter,
  arRouter,
  homeRouter,
  phase4Router,
  personalizationRouter,
  awardsApiRouter,
  stripeRouter,
];

for (const r of routers) {
  app.use('/api', r);
  app.use('/api/v1', r);
}
if (process.env.DEBUG_DIAG === '1') app.use('/api/v1', qaRouter);

// Global error handler so nothing crashes
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err?.code || err?.message || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;