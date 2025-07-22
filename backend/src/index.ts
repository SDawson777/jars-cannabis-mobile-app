import dotenv from 'dotenv';
dotenv.config(); // <-- MUST be called first!

import * as Sentry from '@sentry/node';
import './firebaseAdmin';
import express, { Request, Response, NextFunction } from 'express';
import { phase4Router } from './routes/phase4';
import SentryInit from './utils/sentry'; // triggers Sentry.init()

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/', phase4Router);

// Type-safe Sentry error handler (always after all routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/sentry-debug', (_req, _res) => {
  throw new Error('Sentry test error!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
