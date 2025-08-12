"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loyaltyRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
exports.loyaltyRouter = (0, express_1.Router)();
exports.loyaltyRouter.get('/loyalty/status', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const status = await prismaClient_1.prisma.loyaltyStatus.upsert({
        where: { userId: uid },
        update: {},
        create: { userId: uid, points: 0, tier: 'Bronze' }
    });
    res.json(status);
});
exports.loyaltyRouter.get('/loyalty/badges', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const items = await prismaClient_1.prisma.loyaltyBadge.findMany({ where: { userId: uid }, orderBy: { earnedAt: 'desc' } });
    res.json({ items });
});
