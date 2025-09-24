// backend/src/controllers/awardsController.ts

import { prisma } from '../prismaClient';
import { Request, Response } from 'express';
import { findRewardInCatalog } from '../rewards/catalog';

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
    const client: any = (req as any).prisma || prisma;
    // First attempt to treat awardId as a reward catalog redemption.
    const reward = findRewardInCatalog(awardId);
    if (reward) {
      // Load or create loyalty status
      const loyalty = await client.loyaltyStatus.upsert({
        where: { userId: uid },
        update: {},
        create: { userId: uid, points: 0, tier: 'Bronze' },
      });
      if (loyalty.points < reward.cost) {
        return res.status(400).json({ error: 'insufficient_points' });
      }
      // Deduct cost
      const updatedLoyalty = await client.loyaltyStatus.update({
        where: { userId: uid },
        data: { points: loyalty.points - reward.cost },
      });

      // Recalculate tier (points decreased, tier might downgrade—decide policy).
      // Policy: tiers persist (no downgrade) unless explicitly decided. We keep existing tier if points drop below threshold.
      // If future requirement to downgrade tiers arises, implement here.

      const createdAward = await client.award.create({
        data: {
          userId: uid,
          // Store redemption as an Award history entry
          title: reward.title,
          description: reward.description,
          iconUrl: reward.iconUrl,
          status: 'REDEEMED',
          redeemedAt: new Date(),
        },
      });
      return res.json({ success: true, award: createdAward, points: updatedLoyalty.points });
    }

    // Fallback: legacy behavior for existing Award entity redemption (achievements)
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
