"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loyaltyRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const prismaClient_1 = require("../prismaClient");
exports.loyaltyRouter = (0, express_1.Router)();
exports.loyaltyRouter.get('/loyalty/status', auth_1.authRequired, async (req, res) => {
    const uid = req.user.id;
    const status = await prismaClient_1.prisma.loyaltyStatus.upsert({
        where: { userId: uid },
        update: {},
        create: { userId: uid, points: 0, tier: 'Bronze' },
    });
    res.json(status);
});
exports.loyaltyRouter.get('/loyalty/badges', auth_1.authRequired, async (req, res) => {
    const uid = req.user.id;
    const badges = await prismaClient_1.prisma.loyaltyBadge.findMany({ where: { userId: uid } });
    res.json({ items: badges });
});
