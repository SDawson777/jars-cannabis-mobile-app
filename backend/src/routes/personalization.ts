import { Router } from 'express';
import { prisma } from '../prismaClient';

export const personalizationRouter = Router();

// ForYouTodayPayload: try DB-driven recommendations when DATABASE_URL is set,
// otherwise return seeded fixture data so demo mode and tests remain stable.
personalizationRouter.get('/personalization/home', async (req, res) => {
  const storeId = (req.query as any).storeId as string | undefined;
  const limit = Math.min(24, parseInt(((req.query as any).limit as any) || '6', 10));

  // If no DB is configured, skip touching the lazy prisma proxy which throws in demo mode.
  if (process.env.DATABASE_URL) {
    try {
      // Prefer DB-driven products if the Prisma client is available
      const items = await prisma.product.findMany({
        take: limit,
        orderBy: { purchasesLast30d: 'desc' as any },
        include: { variants: true },
      });

      let results = items;
      if (storeId && prisma.storeProduct) {
        try {
          const stocked = await prisma.storeProduct.findMany({
            where: { storeId: String(storeId) },
          });
          const inStock = new Set(stocked.map((s: any) => s.productId));
          results = results.sort(
            (a: any, b: any) => Number(inStock.has(b.id)) - Number(inStock.has(a.id))
          );
        } catch {
          // ignore store scoping failures
        }
      }

      const products = results.map((p: any) => {
        const price = p.variants && p.variants.length ? p.variants[0].price : p.price || 0;
        return { id: p.id, name: p.name, price, image: p.image ?? null };
      });

      return res.json({ greeting: 'Hi there', message: 'Recommended for you', products });
    } catch (err) {
      // If DB call fails, fall through to fixture
      console.debug(
        'personalization: DB lookup failed, using fixture',
        (err as any)?.message || err
      );
    }
  }

  // Fixture fallback
  const fixture = {
    greeting: 'Good morning',
    message: 'Here are some picks for you today',
    products: [
      { id: 'prod_1', name: 'Daily Blend', price: 1999, image: '/images/prod_1.png' },
      { id: 'prod_2', name: 'Sleep Tincture', price: 2499, image: '/images/prod_2.png' },
    ],
  };
  res.json(fixture);
});

export default personalizationRouter;
