import { Router } from 'express';

export const productsRouter = Router();

// GET /products
productsRouter.get('/products', (_req, res) => {
  res.json([]);
});

// GET /products/:id
productsRouter.get('/products/:id', (req, res) => {
  res.json({ id: req.params.id });
});
