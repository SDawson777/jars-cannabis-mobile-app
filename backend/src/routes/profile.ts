import { Router } from 'express';

export const profileRouter = Router();

let profile = { id: 'user-1', name: 'Demo User' };

// GET /profile
profileRouter.get('/profile', (_req, res) => {
  res.json(profile);
});

// PUT /profile
profileRouter.put('/profile', (req, res) => {
  profile = { ...profile, ...req.body };
  res.json(profile);
});
