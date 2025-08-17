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
import { storesRouter } from './routes/stores';
import { logger } from './utils/logger';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN?.split(',') as any) || '*' }));

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

try { initFirebase(); } catch (e) {
  logger.debug('Firebase init skipped:', (e as any)?.message);
}

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
app.use('/api/v1', homeRouter);
if (process.env.DEBUG_DIAG === '1') app.use('/api/v1', qaRouter);

// Global error handler so nothing crashes
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err?.code || err?.message || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => logger.debug(`🚀 Backend listening on http://localhost:${port}`));
