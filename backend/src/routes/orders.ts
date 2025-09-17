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

const rawOrders = await prisma.order.findMany({ 
  where, 
  orderBy: { createdAt: 'desc' }, 
  take, 
  skip, 
  include: { 
    items: {
      include: {
        product: true,
        variant: true
      }
    },
    store: true
  } 
});

// Transform to match expected OrdersResponse format
const orders = rawOrders.map(order => ({
  id: order.id,
  createdAt: order.createdAt.toISOString(),
  total: order.total || 0,
  status: order.status,
  store: order.store.name,
  subtotal: order.subtotal || 0,
  taxes: order.tax || 0, // Rename tax -> taxes
  fees: 0, // Add fees field (0 for now)
  items: order.items.map(item => ({
    id: item.id,
    name: item.variant?.name || item.product.name,
    quantity: item.quantity,
    price: item.unitPrice || 0
  }))
}));

res.json({ orders });
});

ordersRouter.get('/orders/:id', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const rawOrder = await prisma.order.findFirst({ 
  where: { id: req.params.id, userId: uid }, 
  include: { 
    items: {
      include: {
        product: true,
        variant: true
      }
    },
    store: true
  } 
});
if (!rawOrder) return res.status(404).json({ error: 'Order not found' });

// Transform to match expected Order format
const order = {
  id: rawOrder.id,
  createdAt: rawOrder.createdAt.toISOString(),
  total: rawOrder.total || 0,
  status: rawOrder.status,
  store: rawOrder.store.name,
  subtotal: rawOrder.subtotal || 0,
  taxes: rawOrder.tax || 0, // Rename tax -> taxes
  fees: 0, // Add fees field (0 for now)
  items: rawOrder.items.map(item => ({
    id: item.id,
    name: item.variant?.name || item.product.name,
    quantity: item.quantity,
    price: item.unitPrice || 0
  }))
};

res.json(order);
});
