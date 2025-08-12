"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
exports.cartRouter = (0, express_1.Router)();
async function getOrCreateCart(userId, storeId) {
    let cart = await prismaClient_1.prisma.cart.findFirst({ where: { userId } });
    if (!cart)
        cart = await prismaClient_1.prisma.cart.create({ data: { userId, storeId } });
    return cart;
}
exports.cartRouter.get('/cart', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const cart = await prismaClient_1.prisma.cart.findFirst({
        where: { userId: uid },
        include: { items: { include: { product: true, variant: true } } }
    });
    res.json(cart || { items: [] });
});
exports.cartRouter.post('/cart/items', auth_1.requireAuth, async (req, res) => {
    const uid = req.user.userId;
    const { productId, variantId, quantity = 1, storeId } = req.body || {};
    if (!productId)
        return res.status(400).json({ error: 'productId required' });
    const cart = await getOrCreateCart(uid, storeId);
    const variant = variantId ? await prismaClient_1.prisma.productVariant.findUnique({ where: { id: variantId } }) : null;
    const product = await prismaClient_1.prisma.product.findUnique({ where: { id: productId } });
    const unitPrice = (variant?.price ?? product?.defaultPrice ?? 0);
    const item = await prismaClient_1.prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity, unitPrice } });
    res.status(201).json(item);
});
exports.cartRouter.put('/cart/items/:itemId', auth_1.requireAuth, async (req, res) => {
    const { quantity } = req.body || {};
    if (quantity && quantity < 1)
        return res.status(400).json({ error: 'quantity >= 1' });
    const item = await prismaClient_1.prisma.cartItem.update({ where: { id: req.params.itemId }, data: { quantity } });
    res.json(item);
});
exports.cartRouter.delete('/cart/items/:itemId', auth_1.requireAuth, async (req, res) => {
    await prismaClient_1.prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
});
