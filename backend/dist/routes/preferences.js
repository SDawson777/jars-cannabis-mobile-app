"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferencesRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const prismaClient_1 = require("../prismaClient");
exports.preferencesRouter = (0, express_1.Router)();
exports.preferencesRouter.get('/preferences', auth_1.authRequired, async (req, res) => {
    const uid = req.user.id;
    const prefs = await prismaClient_1.prisma.userPreference.upsert({
        where: { userId: uid },
        update: {},
        create: {
            userId: uid,
            reducedMotion: false,
            dyslexiaFont: false,
            highContrast: false,
            personalization: true,
        },
    });
    res.json(prefs);
});
exports.preferencesRouter.put('/preferences', auth_1.authRequired, async (req, res) => {
    const uid = req.user.id;
    const prefs = await prismaClient_1.prisma.userPreference.update({ where: { userId: uid }, data: req.body });
    res.json(prefs);
});
