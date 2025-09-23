import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const loyaltyRouter = Router();

loyaltyRouter.get('/loyalty/status', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const status = await prisma.loyaltyStatus.upsert({
    where: { userId: uid },
    update: {},
    create: { userId: uid, points: 0, tier: 'Bronze' },
  });
  res.json(status);
});

loyaltyRouter.get('/loyalty/badges', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const items = await prisma.loyaltyBadge.findMany({
    where: { userId: uid },
    orderBy: { earnedAt: 'desc' },
  });
  res.json({ items });
});
