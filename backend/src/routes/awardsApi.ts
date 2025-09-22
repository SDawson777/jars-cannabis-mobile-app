import { Router } from 'express';
import { redeemAward, getAwardById } from '../controllers/awardsController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const awardsApiRouter = Router();

// GET /awards -> { user, awards }
awardsApiRouter.get('/awards', async (req, res) => {
  try {
    const user = (req as any).user || { id: 'anonymous', name: 'You' };
    const awards = await prisma.award.findMany({ where: { userId: user.id } });
    return res.json({ user: { id: user.id, name: (user.name as string) || 'You', points: (user.points as number) || 0, tier: (user.tier as string) || '', progress: (user.progress as number) || 0 }, awards });
  } catch (err) {
    console.error('Error in awards route:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /awards/:id/redeem -> { success, award }
awardsApiRouter.post('/awards/:id/redeem', async (req, res) => {
  // Normalize to controller's expected body shape: { awardId }
  req.body = { awardId: req.params.id } as any;
  return redeemAward(req as any, res as any);
});

// GET single award
awardsApiRouter.get('/awards/:id', async (req, res) => getAwardById(req as any, res as any));

export default awardsApiRouter;
