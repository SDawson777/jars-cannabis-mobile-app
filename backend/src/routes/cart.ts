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
  const refreshed = await prisma.cart.findFirst({
    where: { userId: uid },
    include: { items: { include: { product: true, variant: true } } },
  });
  const cartObj = refreshed || { items: [] };
  const total = (cartObj.items || []).reduce(
    (s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1),
    0
  );
  (cartObj as any).total = total;
  return res.json({ cart: cartObj });
});

cartRouter.post('/cart/items', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { productId, variantId, quantity = 1, storeId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId required' });
  if (quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });
  const cart = await getOrCreateCart(uid, storeId);
  const variant = variantId
    ? await prisma.productVariant.findUnique({ where: { id: variantId } })
    : null;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: 'product not found' });
  const unitPrice = (variant?.price ?? product?.defaultPrice ?? 0) as number;
  const item = await prisma.cartItem.create({
    data: { cartId: cart.id, productId, variantId, quantity, unitPrice },
  });
  const refreshed = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true, variant: true } } },
  });
  const total = (refreshed?.items || []).reduce(
    (s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1),
    0
  );
  return res.status(201).json({ item, cart: refreshed, total });
});

// Accepts { items?: [{ productId, variantId?, quantity }], promo?: string, storeId?: string }

cartRouter.post('/cart/update', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { items = [], storeId } = req.body || {};
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
      const variant = inc.variantId
        ? await prisma.productVariant.findUnique({ where: { id: inc.variantId } })
        : null;
      const product = await prisma.product.findUnique({ where: { id: inc.productId } });
      const unitPrice = (variant?.price ?? product?.defaultPrice ?? 0) as number;
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: inc.productId,
          variantId: inc.variantId,
          quantity: inc.quantity || 1,
          unitPrice,
        },
      });
    }
  }

  // Apply promo code if provided
  const { promo } = req.body || {};
  let appliedPromo: { code: string; discountPercent: number } | null = null;

  if (promo && typeof promo === 'string') {
    // Validate promo codes (aligned with /cart/apply-coupon logic)
    const validPromos: Record<string, number> = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME15: 15,
      NIMBUS25: 25,
    };
    const discountPercent = validPromos[promo.toUpperCase()];
    if (discountPercent) {
      appliedPromo = { code: promo.toUpperCase(), discountPercent };
      // Store promo on cart for persistence
      await prisma.cart.update({
        where: { id: cart.id },
        data: { promoCode: promo.toUpperCase() },
      });
    }
  }

  const refreshed = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true, variant: true } } },
  });

  // Compute subtotal
  const subtotal = (refreshed?.items || []).reduce(
    (s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1),
    0
  );

  // Apply discount if promo is valid
  const discount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = subtotal - discount;

  res.json({
    ...(refreshed || { items: [] }),
    subtotal,
    discount,
    total,
    coupon: appliedPromo,
  });
});

cartRouter.put('/cart/items/:itemId', requireAuth, async (req, res) => {
  const { quantity } = req.body || {};
  if (quantity && quantity < 1) return res.status(400).json({ error: 'quantity >= 1' });
  try {
    const item = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity },
    });
    const cart = await prisma.cart.findUnique({
      where: { id: item.cartId },
      include: { items: { include: { product: true, variant: true } } },
    });
    const total = (cart?.items || []).reduce(
      (s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1),
      0
    );
    return res.json({ item, cart, total });
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
});

cartRouter.delete('/cart/items/:itemId', requireAuth, async (req, res) => {
  try {
    const deleted = await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    const cart = await prisma.cart.findUnique({
      where: { id: deleted.cartId },
      include: { items: { include: { product: true, variant: true } } },
    });
    return res.json({ message: 'item removed', cart });
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
});

// DELETE /cart - clear current user's cart
cartRouter.delete('/cart', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const cart = await prisma.cart.findFirst({ where: { userId: uid } });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  const existing = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
  const ids = existing.map((it: any) => it.id);
  if (ids.length) await prisma.cartItem.deleteMany({ where: { id: { in: ids } } });
  const refreshed = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true, variant: true } } },
  });
  return res.json({ message: 'cart cleared', cart: refreshed });
});

// POST /cart/apply-coupon - coupon handling with discount computation
cartRouter.post('/cart/apply-coupon', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'coupon required' });

  const cart = await prisma.cart.findFirst({ where: { userId: uid } });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  // Validate promo codes with discount percentages
  const validPromos: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    WELCOME15: 15,
    NIMBUS25: 25,
  };

  const upperCode = code.toUpperCase();
  const discountPercent = validPromos[upperCode];

  if (!discountPercent) {
    return res.status(400).json({ error: 'invalid coupon' });
  }

  // Store promo code on cart
  await prisma.cart.update({
    where: { id: cart.id },
    data: { promoCode: upperCode },
  });

  const refreshed = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true, variant: true } } },
  });

  // Compute totals with discount
  const subtotal = (refreshed?.items || []).reduce(
    (s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 1),
    0
  );
  const discount = (subtotal * discountPercent) / 100;
  const total = subtotal - discount;

  return res.json({
    cart: {
      ...refreshed,
      subtotal,
      discount,
      total,
      coupon: { code: upperCode, discountPercent },
    },
  });
});
