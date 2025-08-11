import { Router } from 'express';

export const awardsRouter = Router();

awardsRouter.get('/awards/status', async (_req, res) => {
  res.json({
    active: true,
    season: '2025',
    categories: ['Top Reviewer', 'Community Helper', 'Greenhouse Scholar'],
  });
});
