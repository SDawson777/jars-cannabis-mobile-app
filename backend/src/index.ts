// backend/src/index.ts
import './firebaseAdmin';
import express from 'express';
import dotenv from 'dotenv';
import { phase4Router } from './routes/phase4';

dotenv.config();
const app = express();
app.use(express.json());

// ← add this block
app.get('/', (_req, res) => {
  res.json({ status: 'healthy' });
});

// then mount all your Phase-4 routes
app.use('/', phase4Router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
