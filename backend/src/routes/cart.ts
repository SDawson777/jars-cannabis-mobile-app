import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const cartRouter = Router();

async function getOrCreateCart(userId: string, storeId?: string) {
let cart = await prisma.cart.findFirst({ where: { userId } });
if (!cart) cart = await prisma.cart.create({ data: { userId, storeId } });
return cart;
}

cartRouter.get('/cart', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const cart = await prisma.cart.findFirst({
where: { userId: uid },
include: { items: { include: { product: true, variant: true } } }
});
res.json(cart || { items: [] });
});

cartRouter.post('/cart/items', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const { productId, variantId, quantity = 1, storeId } = req.body || {};
if (!productId) return res.status(400).json({ error: 'productId required' });
const cart = await getOrCreateCart(uid, storeId);
const variant = variantId ? await prisma.productVariant.findUnique({ where: { id: variantId } }) : null;
const product = await prisma.product.findUnique({ where: { id: productId } });
const unitPrice = (variant?.price ?? product?.defaultPrice ?? 0) as number;
const item = await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity, unitPrice } });
res.status(201).json(item);
});

cartRouter.put('/cart/items/:itemId', requireAuth, async (req, res) => {
const { quantity } = req.body || {};
if (quantity && quantity < 1) return res.status(400).json({ error: 'quantity >= 1' });
const item = await prisma.cartItem.update({ where: { id: req.params.itemId }, data: { quantity } });
res.json(item);
});

cartRouter.delete('/cart/items/:itemId', requireAuth, async (req, res) => {
await prisma.cartItem.delete({ where: { id: req.params.itemId } });
res.status(204).send();
});
