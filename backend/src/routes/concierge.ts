import { Router } from 'express';

export const conciergeRouter = Router();

// POST /concierge/chat
conciergeRouter.post('/concierge/chat', (_req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

