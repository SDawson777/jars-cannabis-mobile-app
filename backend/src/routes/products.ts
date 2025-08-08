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

// GET /products/:id/reviews
productsRouter.get('/products/:id/reviews', (req, res) => {
  res.json([]);
});

// POST /products/:id/reviews
productsRouter.post('/products/:id/reviews', (req, res) => {
  res.status(201).json({ id: req.params.id, review: req.body });
});

