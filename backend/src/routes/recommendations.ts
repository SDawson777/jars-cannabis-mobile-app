import { Router } from 'express';
import { authOptional } from '../util/auth';
import { forYou } from '../modules/recommendations/service';
import { prisma } from '../prismaClient';

export const recommendationsRouter = Router();

recommendationsRouter.get('/recommendations/for-you', authOptional, async (req, res) => {
  const userId = (req as any).user?.id;
  const storeId = (req.query.storeId as string) || undefined;
  const data = await forYou(userId, storeId);
  res.json({ items: data });
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
      take: Math.min(20, parseInt(limit || '8')),
      orderBy: { purchasesLast30d: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
