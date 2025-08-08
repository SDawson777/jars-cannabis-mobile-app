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

// Profile preferences (phase 4)
let preferences = { highContrast: false };

profileRouter.get('/profile/preferences', (_req, res) => {
  res.json(preferences);
});

profileRouter.put('/profile/preferences', (req, res) => {
  preferences = { ...preferences, ...req.body };
  res.json(preferences);
});

