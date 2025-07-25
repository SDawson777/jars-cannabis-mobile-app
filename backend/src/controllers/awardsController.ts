// backend/src/controllers/awardsController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// We assume authMiddleware has already run and attached `user` to req.
type AuthReq = Request & { user: { id: string } };

/**
 * GET /api/awards
 * Returns all awards for the authenticated user.
 */
export async function getAwards(req: Request, res: Response) {
  const { user } = req as AuthReq;
  const awards = await prisma.award.findMany({ where: { userId: user.id } });
  res.json(awards);
}

/**
 * POST /api/awards/redeem
 * Redeem an award for the authenticated user.
 * Body: { awardId }
 */
export async function redeemAward(req: Request, res: Response) {
  const { user } = req as AuthReq;
  const { awardId } = req.body as { awardId: string };
  if (!awardId) {
    return res.status(400).json({ error: 'awardId is required' });
  }

  try {
    // Ensure the award exists and belongs to this user
    const award = await prisma.award.findUnique({ where: { id: awardId } });
    if (!award) {
      return res.status(404).json({ error: 'Award not found' });
    }
    if (award.userId !== user.id) {
      return res.status(403).json({ error: 'Award does not belong to user' });
    }
    if (award.status === 'REDEEMED') {
      return res.status(400).json({ error: 'Award already redeemed' });
    }

    const updated = await prisma.award.update({
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
  const { awardId } = req.params as { awardId: string };
  const award = await prisma.award.findUnique({ where: { id: awardId } });
  if (!award) return res.status(404).json({ error: 'Award not found' });
  res.json(award);
}
