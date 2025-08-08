import { Router } from 'express';

export const contentRouter = Router();

// GET /content/faq
contentRouter.get('/content/faq', (_req, res) => {
  res.json([]);
});

// GET /content/legal
contentRouter.get('/content/legal', (_req, res) => {
  res.json({});
});

