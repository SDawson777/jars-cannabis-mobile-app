"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const prismaClient_1 = require("../prismaClient");
exports.journalRouter = (0, express_1.Router)();
exports.journalRouter.get('/journal/entries', auth_1.authRequired, async (req, res) => {
    const items = await prismaClient_1.prisma.journalEntry.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
});
exports.journalRouter.post('/journal/entries', auth_1.authRequired, async (req, res) => {
    const { productId, rating, notes, tags = [] } = req.body;
    const created = await prismaClient_1.prisma.journalEntry.create({
        data: { userId: req.user.id, productId, rating, notes, tags },
    });
    await prismaClient_1.prisma.userEvent.create({
        data: { userId: req.user.id, type: 'journal', productId, tags },
    });
    res.status(201).json(created);
});
exports.journalRouter.put('/journal/entries/:id', auth_1.authRequired, async (req, res) => {
    const updated = await prismaClient_1.prisma.journalEntry.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(updated);
});
