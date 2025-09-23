import { Router } from 'express';

export const greenhouseRouter = Router();

// GET /greenhouse/articles
greenhouseRouter.get('/greenhouse/articles', (_req, res) => {
  res.json([]);
});

// GET /greenhouse/articles/:slug
greenhouseRouter.get('/greenhouse/articles/:slug', (req, res) => {
  res.json({ slug: req.params.slug });
});

// POST /greenhouse/articles/:slug/complete
greenhouseRouter.post('/greenhouse/articles/:slug/complete', (req, res) => {
  res.json({ slug: req.params.slug, completed: true });
});
