import { Router } from 'express';

export const cartRouter = Router();

let cart: any[] = [];

// GET /cart
cartRouter.get('/cart', (_req, res) => {
  res.json(cart);
});

// POST /cart - add item
cartRouter.post('/cart', (req, res) => {
  cart.push(req.body);
  res.status(201).json(cart);
});

// PUT /cart/:itemId - update item
cartRouter.put('/cart/:itemId', (req, res) => {
  const { itemId } = req.params;
  cart = cart.map(item => (item.id === itemId ? { ...item, ...req.body } : item));
  res.json(cart);
});

// DELETE /cart/:itemId
cartRouter.delete('/cart/:itemId', (req, res) => {
  cart = cart.filter(item => item.id !== req.params.itemId);
  res.status(204).send();
});

