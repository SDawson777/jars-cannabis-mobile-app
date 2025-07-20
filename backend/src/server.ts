// backend/src/server.ts

import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import phase4Router from './routes/phase4';
import { authMiddleware } from './middleware/authMiddleware';
import { login } from './controllers/authController';
import { startWorker } from './workers/startQueue';

const app = express();

// Parse JSON request bodies
app.use(bodyParser.json());

// Start the background worker for data exports
startWorker();

// Public authentication endpoint
app.post('/api/login', login);

// Secure all Phase 4 routes under /api with JWT auth
app.use('/api', authMiddleware, phase4Router);

const PORT = Number(process.env.PORT) || 4010;
app.listen(PORT, () => {
  console.log(`Phase 4 API running on http://localhost:${PORT}`);
});
