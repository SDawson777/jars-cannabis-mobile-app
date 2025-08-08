import { Router } from 'express';

export const storesRouter = Router();

// GET /stores
storesRouter.get('/stores', (_req, res) => {
  res.json([]);
});

// GET /stores/:id
storesRouter.get('/stores/:id', (req, res) => {
  res.json({ id: req.params.id });
});

