import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const profileRouter = Router();

profileRouter.get('/profile', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    id: user.id,
    email: user.email,
    name: (user as any).name ?? null,
    phone: (user as any).phone ?? null,
    createdAt: user.createdAt,
  });
});

profileRouter.put('/profile', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { name, phone, email } = req.body || {};
  try {
    const updated = await prisma.user.update({
      where: { id: uid },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
      },
    });
    return res.json({
      id: updated.id,
      email: updated.email,
      name: (updated as any).name ?? null,
      phone: (updated as any).phone ?? null,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

profileRouter.post('/profile/push-token', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    await prisma.user.update({ where: { id: uid }, data: { fcmToken: token } });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error saving fcm token:', err);
    return res.status(500).json({ error: 'Failed to save token' });
  }
});

profileRouter.get('/profile/preferences', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const prefs = await prisma.userPreference.findUnique({ where: { userId: uid } });
  return res.json(
    prefs || {
      reducedMotion: false,
      dyslexiaFont: false,
      highContrast: false,
      personalization: true,
    }
  );
});

profileRouter.put('/profile/preferences', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const data = req.body || {};
  const up = await prisma.userPreference.upsert({
    where: { userId: uid },
    create: { userId: uid, ...data },
    update: data,
  });
  return res.json(up);
});
