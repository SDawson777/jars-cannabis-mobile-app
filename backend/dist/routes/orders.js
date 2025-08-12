"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
exports.ordersRouter = (0, express_1.Router)();
exports.ordersRouter.post('/orders', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const { storeId, contact, paymentMethod = 'pay_at_pickup', notes } = req.body || {};
    if (!storeId)
        return res.status(400).json({ error: 'storeId required' });
    const cart = await prismaClient_1.prisma.cart.findFirst({
        where: { userId: uid },
        include: { items: true }
    });
    if (!cart || cart.items.length === 0)
        return res.status(400).json({ error: 'Cart is empty' });
    const items = await Promise.all(cart.items.map(async (ci) => {
        const price = (ci.unitPrice ?? 0);
        return {
            productId: ci.productId,
            variantId: ci.variantId || undefined,
            quantity: ci.quantity,
            unitPrice: price,
            lineTotal: price * ci.quantity,
        };
    }));
    const subtotal = items.reduce((s, i) => s + (i.lineTotal || 0), 0);
    const tax = Math.round(subtotal * 0.06 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const order = await prismaClient_1.prisma.order.create({
        data: {
            userId: uid,
            storeId,
            status: 'CREATED',
            paymentMethod,
            notes,
            contactName: contact?.name,
            contactPhone: contact?.phone,
            contactEmail: contact?.email,
            subtotal, tax, total,
            items: { create: items }
        },
        include: { items: true }
    });
    await prismaClient_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(201).json(order);
});
exports.ordersRouter.get('/orders', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const { status, page = '1', limit = '24' } = req.query;
    const where = { userId: uid };
    if (status)
        where.status = status;
    const take = Math.min(100, parseInt(limit));
    const skip = (Math.max(1, parseInt(page)) - 1) * take;
    const items = await prismaClient_1.prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip, include: { items: true } });
    res.json({ items });
});
exports.ordersRouter.get('/orders/:id', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const o = await prismaClient_1.prisma.order.findFirst({ where: { id: req.params.id, userId: uid }, include: { items: true } });
    if (!o)
        return res.status(404).json({ error: 'Order not found' });
    res.json(o);
});
