import { Router } from 'express';

export const ordersRouter = Router();

let orders: any[] = [];

// POST /orders - create order
ordersRouter.post('/orders', (req, res) => {
  const order = { id: String(orders.length + 1), ...req.body };
  orders.push(order);
  res.status(201).json(order);
});

// GET /orders - list orders
ordersRouter.get('/orders', (_req, res) => {
  res.json(orders);
});

// GET /orders/:id - order detail
ordersRouter.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

