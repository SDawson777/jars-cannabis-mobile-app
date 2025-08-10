"use strict";
// backend/src/controllers/awardsController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwardById = exports.redeemAward = exports.getAwards = void 0;
const client_1 = require("@prisma/client");
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
exports.redeemAward = redeemAward;
/**
 * GET /api/awards/:awardId
 * Public: fetch a single award by ID.
 */
async function getAwardById(req, res) {
    const { awardId } = req.params;
    const award = await prisma.award.findUnique({ where: { id: awardId } });
    if (!award)
        return res.status(404).json({ error: 'Award not found' });
    res.json(award);
}
exports.getAwardById = getAwardById;
