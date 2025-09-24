// backend/src/controllers/awardsController.ts

import { prisma } from '../prismaClient';
import { Request, Response } from 'express';

// We assume authMiddleware has already run and attached `user` to req.
type AuthReq = Request & { user: { id?: string; userId?: string } };

/**
 * GET /api/awards
 * Returns all awards for the authenticated user.
 */
export async function getAwards(req: Request, res: Response) {
  const { user } = req as AuthReq;
  const uid = user.userId || user.id;
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const client: any = (req as any).prisma || prisma;
  const awards = await client.award.findMany({ where: { userId: uid } });
  res.json(awards);
}

/**
 * POST /api/awards/redeem
 * Redeem an award for the authenticated user.
 * Body: { awardId }
 */
export async function redeemAward(req: Request, res: Response) {
  const { user } = req as AuthReq;
  const uid = user.userId || user.id;
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const { awardId } = req.body as { awardId: string };
  if (!awardId) {
    return res.status(400).json({ error: 'awardId is required' });
  }

  try {
    // Ensure the award exists and belongs to this user
    const client: any = (req as any).prisma || prisma;
    const award = await client.award.findUnique({ where: { id: awardId } });
    if (!award) {
      return res.status(404).json({ error: 'Award not found' });
    }
    if (award.userId !== uid) {
      return res.status(403).json({ error: 'Award does not belong to user' });
    }
    if (award.status === 'REDEEMED') {
      return res.status(400).json({ error: 'Award already redeemed' });
    }

    const updated = await client.award.update({
      where: { id: awardId },
      data: { status: 'REDEEMED', redeemedAt: new Date() },
    });

    // Simple loyalty integration: increment points and adjust tier thresholds
    const increment = 50; // flat increment per redemption for now
    const loyalty = await client.loyaltyStatus.upsert({
      where: { userId: uid },
      update: { points: { increment } },
      create: { userId: uid, points: increment, tier: 'Bronze' },
    });

    // Recalculate tier if thresholds crossed
    let newTier = loyalty.tier;
    const pts = loyalty.points;
    if (pts >= 1000) newTier = 'Platinum';
    else if (pts >= 500) newTier = 'Gold';
    else if (pts >= 250) newTier = 'Silver';
    else newTier = 'Bronze';
    if (newTier !== loyalty.tier) {
      await client.loyaltyStatus.update({ where: { userId: uid }, data: { tier: newTier } });
    }

    return res.json({ success: true, award: updated });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}

/**
 * GET /api/awards/:awardId
 * Public: fetch a single award by ID.
 */
export async function getAwardById(req: Request, res: Response) {
  const { id, awardId } = req.params as { id?: string; awardId?: string };
  const lookupId = awardId || id; // support either param name
  if (!lookupId) return res.status(400).json({ error: 'awardId required' });
  const client: any = (req as any).prisma || prisma;
  const award = await client.award.findUnique({ where: { id: lookupId } });
  if (!award) return res.status(404).json({ error: 'Award not found' });
  res.json(award);
}
