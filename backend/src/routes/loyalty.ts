import { Router } from 'express';
import { authRequired } from '../util/auth';
import { prisma } from '../prismaClient';

export const loyaltyRouter = Router();

loyaltyRouter.get('/loyalty/status', authRequired, async (req, res) => {
  const uid = (req as any).user.id;
  const status = await prisma.loyaltyStatus.upsert({
    where: { userId: uid },
    update: {},
    create: { userId: uid, points: 0, tier: 'Bronze' },
  });
  res.json(status);
});

loyaltyRouter.get('/loyalty/badges', authRequired, async (req, res) => {
  const uid = (req as any).user.id;
  const badges = await prisma.loyaltyBadge.findMany({ where: { userId: uid } });
  res.json({ items: badges });
});
