import { Router } from 'express';

export const loyaltyRouter = Router();

// GET /loyalty/status
loyaltyRouter.get('/loyalty/status', (_req, res) => {
  res.json({ status: 'bronze' });
});

// GET /loyalty/badges
loyaltyRouter.get('/loyalty/badges', (_req, res) => {
  res.json([]);
});

