import { Router } from 'express';

export const arRouter = Router();

// GET /ar/models/:productId
arRouter.get('/ar/models/:productId', (_req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

