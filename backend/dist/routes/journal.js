"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
exports.journalRouter = (0, express_1.Router)();
exports.journalRouter.get('/journal/entries', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const page = parseInt(req.query.page || '1');
    const limit = Math.min(100, parseInt(req.query.limit || '24'));
    const items = await prismaClient_1.prisma.journalEntry.findMany({
        where: { userId: uid },
        orderBy: { createdAt: 'desc' },
        take: limit, skip: (page - 1) * limit
    });
    res.json({ items });
});
exports.journalRouter.post('/journal/entries', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const { productId, rating, tags = [], note } = req.body || {};
    if (!productId)
        return res.status(400).json({ error: 'productId required' });
    const entry = await prismaClient_1.prisma.journalEntry.create({ data: { userId: uid, productId, rating, notes: note, tags } });
    res.status(201).json(entry);
});
exports.journalRouter.put('/journal/entries/:id', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const { rating, tags, note } = req.body || {};
    const existing = await prismaClient_1.prisma.journalEntry.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== uid)
        return res.status(403).json({ error: 'Forbidden' });
    const entry = await prismaClient_1.prisma.journalEntry.update({ where: { id: req.params.id }, data: { rating, tags, notes: note } });
    res.json(entry);
});
