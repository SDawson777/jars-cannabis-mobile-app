"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const prismaClient_1 = require("../prismaClient");
exports.reviewsRouter = (0, express_1.Router)();
exports.reviewsRouter.get('/:id/reviews', async (req, res) => {
    const items = await prismaClient_1.prisma.review.findMany({
        where: { productId: req.params.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
});
exports.reviewsRouter.post('/:id/reviews', auth_1.authRequired, async (req, res) => {
    const { rating, text } = req.body;
    if (!rating)
        return res.status(400).json({ error: 'rating required' });
    const review = await prismaClient_1.prisma.review.create({
        data: {
            productId: req.params.id,
            userId: req.user.id,
            rating,
            text,
        },
    });
    res.status(201).json(review);
});
