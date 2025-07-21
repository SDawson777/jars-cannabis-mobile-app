'use strict';
// backend/src/controllers/awardsController.ts
Object.defineProperty(exports, '__esModule', { value: true });
exports.getAwardById = exports.redeemAward = exports.getAwards = void 0;
const client_1 = require('@prisma/client');
const prisma = new client_1.PrismaClient();
/**
 * GET /api/awards
 * Returns all awards for the authenticated user.
 */
async function getAwards(req, res) {
  const { user } = req;
  const awards = await prisma.award.findMany({ where: { userId: user.id } });
  res.json(awards);
}
exports.getAwards = getAwards;
/**
 * POST /api/awards/redeem
 * Redeem an award for the authenticated user.
 * Body: { awardId }
 */
async function redeemAward(req, res) {
  const { user } = req;
  const { awardId } = req.body;
  // TODO: redemption logic...
  res.json({
    success: true,
    message: `Award ${awardId} redeemed for user ${user.id}`,
  });
}
exports.redeemAward = redeemAward;
/**
 * GET /api/awards/:awardId
 * Public: fetch a single award by ID.
 */
async function getAwardById(req, res) {
  const { awardId } = req.params;
  const award = await prisma.award.findUnique({ where: { id: awardId } });
  if (!award) return res.status(404).json({ error: 'Award not found' });
  res.json(award);
}
exports.getAwardById = getAwardById;
