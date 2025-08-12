"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
exports.recommendationsRouter = (0, express_1.Router)();
// Simple "for you": popular products, optionally scoped to store
exports.recommendationsRouter.get('/recommendations/for-you', async (req, res, next) => {
    try {
        const { storeId, limit = '24' } = req.query;
        const take = Math.min(100, parseInt(limit || '24', 10));
        let items = await prismaClient_1.prisma.product.findMany({
            orderBy: { purchasesLast30d: 'desc' },
            take,
            include: { variants: true }
        });
        if (storeId) {
            const stocked = await prismaClient_1.prisma.storeProduct.findMany({ where: { storeId: String(storeId) } });
            const inStock = new Set(stocked.map(s => s.productId));
            items = items.sort((a, b) => Number(inStock.has(b.id)) - Number(inStock.has(a.id)));
        }
        res.json({ items });
    }
    catch (err) {
        next(err);
    }
});
// "Related": same brand/category
exports.recommendationsRouter.get('/recommendations/related/:productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { limit = '8' } = req.query;
        const base = await prismaClient_1.prisma.product.findUnique({ where: { id: productId } });
        if (!base)
            return res.json({ items: [] });
        const items = await prismaClient_1.prisma.product.findMany({
            where: {
                id: { not: base.id },
                OR: [{ brand: base.brand ?? undefined }, { category: base.category }]
            },
            take: Math.min(20, parseInt(limit || '8', 10)),
            orderBy: { purchasesLast30d: 'desc' }
        });
        res.json({ items });
    }
    catch (err) {
        next(err);
    }
});
