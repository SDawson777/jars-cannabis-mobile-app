import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const ordersRouter = Router();

ordersRouter.post('/orders', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const { storeId, contact, paymentMethod = 'pay_at_pickup', notes } = req.body || {};
if (!storeId) return res.status(400).json({ error: 'storeId required' });

const cart = await prisma.cart.findFirst({
where: { userId: uid },
include: { items: true }
});
if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

const items = await Promise.all(cart.items.map(async ci => {
const price = (ci.unitPrice ?? 0) as number;
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

const order = await prisma.order.create({
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

await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

res.status(201).json(order);
});

ordersRouter.get('/orders', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const { status, page = '1', limit = '24' } = req.query as Record<string,string>;
const where: any = { userId: uid };
if (status) where.status = status as any;
const take = Math.min(100, parseInt(limit));
const skip = (Math.max(1, parseInt(page)) - 1) * take;
const items = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip, include: { items: true } });
res.json({ items });
});

ordersRouter.get('/orders/:id', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const o = await prisma.order.findFirst({ where: { id: req.params.id, userId: uid }, include: { items: true } });
if (!o) return res.status(404).json({ error: 'Order not found' });
res.json(o);
});
