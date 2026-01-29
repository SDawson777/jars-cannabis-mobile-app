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
  
  // Whitelist allowed fields to prevent mass assignment
  const { reducedMotion, dyslexiaFont, highContrast, personalization } = req.body || {};
  
  const updateData: any = {};
  if (typeof reducedMotion === 'boolean') updateData.reducedMotion = reducedMotion;
  if (typeof dyslexiaFont === 'boolean') updateData.dyslexiaFont = dyslexiaFont;
  if (typeof highContrast === 'boolean') updateData.highContrast = highContrast;
  if (typeof personalization === 'boolean') updateData.personalization = personalization;
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid preferences provided' });
  }
  
  const prefs = await prisma.userPreference.update({ 
    where: { userId: uid }, 
    data: updateData 
  });
  res.json(prefs);
});
