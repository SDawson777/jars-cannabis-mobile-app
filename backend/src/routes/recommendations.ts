import { Router } from 'express';

export const recommendationsRouter = Router();

// GET /recommendations/for-you
recommendationsRouter.get('/recommendations/for-you', (_req, res) => {
  res.json([]);
});

// GET /recommendations/related/:productId
recommendationsRouter.get('/recommendations/related/:productId', (req, res) => {
  res.json([]);
});

