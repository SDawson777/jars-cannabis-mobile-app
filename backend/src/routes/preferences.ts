import { Router } from 'express';
import { authRequired } from '../util/auth';
import { prisma } from '../prismaClient';

export const preferencesRouter = Router();

preferencesRouter.get('/preferences', authRequired, async (req, res) => {
  const uid = (req as any).user.id;
  const prefs = await prisma.userPreference.upsert({
    where: { userId: uid },
    update: {},
    create: {
      userId: uid,
      reducedMotion: false,
      dyslexiaFont: false,
      highContrast: false,
      personalization: true,
    },
  });
  res.json(prefs);
});

preferencesRouter.put('/preferences', authRequired, async (req, res) => {
  const uid = (req as any).user.id;
  const prefs = await prisma.userPreference.update({ where: { userId: uid }, data: req.body });
  res.json(prefs);
});
