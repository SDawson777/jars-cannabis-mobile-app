import { Router } from 'express';
import { prisma } from '../prismaClient';

export const recommendationsRouter = Router();

// Simple "for you": popular products, optionally scoped to store
recommendationsRouter.get('/recommendations/for-you', async (req, res, next) => {
  try {
    const { storeId, limit = '24' } = req.query as any;
    const take = Math.min(100, parseInt(limit || '24', 10));
    let items = await prisma.product.findMany({
      orderBy: { purchasesLast30d: 'desc' },
      take,
      include: { variants: true },
    });
    if (storeId) {
      const stocked = await prisma.storeProduct.findMany({ where: { storeId: String(storeId) } });
      const inStock = new Set(stocked.map(s => s.productId));
      items = items.sort((a, b) => Number(inStock.has(b.id)) - Number(inStock.has(a.id)));
    }
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// "Related": same brand/category
recommendationsRouter.get('/recommendations/related/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = '8' } = req.query as any;
    const base = await prisma.product.findUnique({ where: { id: productId } });
    if (!base) return res.json({ items: [] });
    const items = await prisma.product.findMany({
      where: {
        id: { not: base.id },
        OR: [{ brand: base.brand ?? undefined }, { category: base.category }],
      },
      take: Math.min(20, parseInt(limit || '8', 10)),
      orderBy: { purchasesLast30d: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
