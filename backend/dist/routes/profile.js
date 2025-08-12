"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.get('/profile', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const user = await prismaClient_1.prisma.user.findUnique({ where: { id: uid } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
});
exports.profileRouter.put('/profile', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    await prismaClient_1.prisma.user.update({ where: { id: uid }, data: {} });
    return res.json({ ok: true });
});
exports.profileRouter.get('/profile/preferences', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const prefs = await prismaClient_1.prisma.userPreference.findUnique({ where: { userId: uid } });
    return res.json(prefs || { reducedMotion: false, dyslexiaFont: false, highContrast: false, personalization: true });
});
exports.profileRouter.put('/profile/preferences', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const data = req.body || {};
    const up = await prismaClient_1.prisma.userPreference.upsert({
        where: { userId: uid },
        create: { userId: uid, ...data },
        update: data,
    });
    return res.json(up);
});
