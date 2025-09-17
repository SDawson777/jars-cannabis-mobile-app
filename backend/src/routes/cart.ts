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

// Accepts { items?: [{ productId, variantId?, quantity }], promo?: string, storeId?: string }
cartRouter.post('/cart/update', requireAuth, async (req, res) => {
	const uid = (req as any).user.userId as string;
	const { items = [], promo, storeId } = req.body || {};
	const cart = await getOrCreateCart(uid, storeId);

	// If items provided, reconcile cart items to match the provided list
	if (Array.isArray(items)) {
		// Build a map for incoming items by productId+variantId
		const key = (it: any) => `${it.productId}:${it.variantId || ''}`;
		const incomingMap = new Map(items.map((it: any) => [key(it), it]));

		// Load existing items
		const existing = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
		const toDelete = [] as string[];
		// Update existing items or mark for deletion
		for (const ex of existing) {
			const k = `${ex.productId}:${ex.variantId ?? ''}`;
			const inc = incomingMap.get(k);
			if (inc) {
				// update quantity if different
				if (inc.quantity !== undefined && inc.quantity !== ex.quantity) {
					await prisma.cartItem.update({ where: { id: ex.id }, data: { quantity: inc.quantity } });
				}
				incomingMap.delete(k);
			} else {
				// not in incoming list -> delete
				toDelete.push(ex.id);
			}
		}

		if (toDelete.length) {
			await prisma.cartItem.deleteMany({ where: { id: { in: toDelete } } });
		}

		// Create any remaining incoming items
		for (const inc of incomingMap.values()) {
			const variant = inc.variantId ? await prisma.productVariant.findUnique({ where: { id: inc.variantId } }) : null;
			const product = await prisma.product.findUnique({ where: { id: inc.productId } });
			const unitPrice = (variant?.price ?? product?.defaultPrice ?? 0) as number;
			await prisma.cartItem.create({ data: { cartId: cart.id, productId: inc.productId, variantId: inc.variantId, quantity: inc.quantity || 1, unitPrice } });
		}
	}

	// TODO: apply promo handling (store promo on cart or compute discount)

	const refreshed = await prisma.cart.findUnique({
		where: { id: cart.id },
		include: { items: { include: { product: true, variant: true } } }
	});

	// compute total
	const total = (refreshed?.items || []).reduce((s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1), 0);

	res.json({ ...(refreshed || { items: [] }), total });
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
