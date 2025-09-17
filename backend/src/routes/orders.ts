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

	const itemsToCreate = await Promise.all(cart.items.map(async ci => {
		const price = (ci.unitPrice ?? 0) as number;
		return {
			productId: ci.productId,
			variantId: ci.variantId || undefined,
			quantity: ci.quantity,
			unitPrice: price,
			lineTotal: price * ci.quantity,
		};
	}));
	const subtotal = itemsToCreate.reduce((s, i) => s + (i.lineTotal || 0), 0);
	const taxes = Math.round(subtotal * 0.06 * 100) / 100;
	const fees = 0;
	const total = Math.round((subtotal + taxes + fees) * 100) / 100;

	const created = await prisma.order.create({
		data: {
			userId: uid,
			storeId,
			status: 'CREATED',
			paymentMethod,
			notes,
			contactName: contact?.name,
			contactPhone: contact?.phone,
			contactEmail: contact?.email,
			subtotal,
			tax: taxes, // keep DB column name `tax` but we'll expose `taxes` to clients
			total,
			items: { create: itemsToCreate }
		},
		include: { items: true }
	});

	await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

	// Hydrate response: populate store name and item names/prices
	const store = await prisma.store.findUnique({ where: { id: storeId } });
	const hydratedItems = await Promise.all((created.items || []).map(async (it: any) => {
		const product = await prisma.product.findUnique({ where: { id: it.productId } });
		const variant = it.variantId ? await prisma.productVariant.findUnique({ where: { id: it.variantId } }) : null;
		return {
			id: it.id,
			name: (variant?.name) || product?.name || 'Item',
			quantity: it.quantity,
			price: it.unitPrice,
		};
	}));

	res.status(201).json({
		id: created.id,
		createdAt: created.createdAt,
		total: created.total,
		status: created.status,
		store: store?.name || '',
		items: hydratedItems,
		subtotal: created.subtotal,
		taxes,
		fees,
	});
});

ordersRouter.get('/orders', requireAuth, async (req, res) => {
	const uid = (req as any).user.userId as string;
	const { status, page = '1', limit = '24' } = req.query as Record<string,string>;
	const where: any = { userId: uid };
	if (status) where.status = status as any;
	const take = Math.min(100, parseInt(limit));
	const pageNum = Math.max(1, parseInt(page));
	const skip = (pageNum - 1) * take;
	const items = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip, include: { items: true } });

	// Hydrate each order
	const orders = await Promise.all(items.map(async (o: any) => {
		const store = await prisma.store.findUnique({ where: { id: o.storeId } });
		const hydratedItems = await Promise.all((o.items || []).map(async (it: any) => {
			const product = await prisma.product.findUnique({ where: { id: it.productId } });
			const variant = it.variantId ? await prisma.productVariant.findUnique({ where: { id: it.variantId } }) : null;
			return {
				id: it.id,
				name: (variant?.name) || product?.name || 'Item',
				quantity: it.quantity,
				price: it.unitPrice,
			};
		}));
		return {
			id: o.id,
			createdAt: o.createdAt,
			total: o.total,
			status: o.status,
			store: store?.name || '',
			items: hydratedItems,
			subtotal: o.subtotal,
			taxes: o.tax ?? 0,
			fees: 0,
		};
	}));

	const nextPage = items.length === take ? pageNum + 1 : undefined;
	res.json({ orders, nextPage });
});

ordersRouter.get('/orders/:id', requireAuth, async (req, res) => {
	const uid = (req as any).user.userId as string;
	const o = await prisma.order.findFirst({ where: { id: req.params.id, userId: uid }, include: { items: true } });
	if (!o) return res.status(404).json({ error: 'Order not found' });
	const store = await prisma.store.findUnique({ where: { id: o.storeId } });
	const hydratedItems = await Promise.all((o.items || []).map(async (it: any) => {
		const product = await prisma.product.findUnique({ where: { id: it.productId } });
		const variant = it.variantId ? await prisma.productVariant.findUnique({ where: { id: it.variantId } }) : null;
		return {
			id: it.id,
			name: (variant?.name) || product?.name || 'Item',
			quantity: it.quantity,
			price: it.unitPrice,
		};
	}));
	res.json({
		id: o.id,
		createdAt: o.createdAt,
		total: o.total,
		status: o.status,
		store: store?.name || '',
		items: hydratedItems,
		subtotal: o.subtotal,
		taxes: o.tax ?? 0,
		fees: 0,
	});
});
