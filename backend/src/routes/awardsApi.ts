import { Router } from 'express';
import { redeemAward, getAwardById } from '../controllers/awardsController';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const awardsApiRouter = Router();

// GET /awards (authenticated) -> { user, awards }
awardsApiRouter.get('/awards', requireAuth, async (req, res) => {
  try {
    const authUser = (req as any).user as { userId: string };
    const userId = authUser.userId;
    const awards = await prisma.award.findMany({ where: { userId } });

    // In a future iteration we could derive points/tier from aggregate tables.
    // For now, compute simple sums + placeholder tier logic.
    const points = awards.reduce((s: number, a: any) => s + (a.pointsValue || 0), 0);
    const tier = points >= 1000 ? 'Platinum' : points >= 500 ? 'Gold' : points >= 250 ? 'Silver' : 'Bronze';
    const progress = Math.min(1, points / 1000);

    return res.json({
      user: { id: userId, name: 'You', points, tier, progress },
      awards,
    });
  } catch (err) {
    console.error('Error in awards route:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /awards/:id/redeem -> { success, award }
awardsApiRouter.post('/awards/:id/redeem', requireAuth, async (req, res) => {
  req.body = { awardId: req.params.id } as any;
  return redeemAward(req as any, res as any);
});

// GET single award
awardsApiRouter.get('/awards/:id', requireAuth, async (req, res) => getAwardById(req as any, res as any));

export default awardsApiRouter;
