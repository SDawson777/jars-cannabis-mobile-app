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
  // TODO: redemption logic...
  res.json({
    success: true,
    message: `Award ${awardId} redeemed for user ${user.id}`,
  });
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
