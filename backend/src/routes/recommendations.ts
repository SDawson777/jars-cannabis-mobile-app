import { Router } from 'express';
import { prisma } from '../prismaClient';

export const recommendationsRouter = Router();

// Simple "for you": popular products, optionally scoped to store
recommendationsRouter.get('/recommendations/for-you', async (req, res, next) => {
  try {
    const { storeId, limit = '24' } = req.query as any;
    const take = Math.min(100, parseInt(limit || '24'));
    const where = storeId ? { storeId: String(storeId) } : undefined;
    const items = await prisma.product.findMany({
      where,
      orderBy: { purchasesLast30d: 'desc' },
      take
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
