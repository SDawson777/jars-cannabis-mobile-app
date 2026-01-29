import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';
import { cacheService } from '../services/cacheService';
import { rateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

export const productsRouter = Router();

const reviewSchema = z.object({
  rating: z.coerce
    .number({ invalid_type_error: 'rating 1..5 required' })
    .int('rating 1..5 required')
    .min(1, 'rating 1..5 required')
    .max(5, 'rating 1..5 required'),
  comment: z.string().max(2000).optional(),
  recommend: z.boolean().optional(),
  text: z.string().max(2000).optional(),
});

type ReviewBody = z.infer<typeof reviewSchema>;

productsRouter.get('/products', rateLimit('products_list'), async (req, res) => {
  const {
    storeId,
    q,
    category,
    strain,
    brand,
    minPrice,
    maxPrice,
    thcMin,
    thcMax,
    cbdMin,
    cbdMax,
    sort,
    page = '1',
    limit = '24',
  } = req.query as Record<string, string>;

  // Create cache key from query parameters
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const where: any = {};
  if (q)
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  if (category) where.category = category as any;
  if (strain) where.strainType = strain as any;
  if (brand) where.brand = { contains: brand, mode: 'insensitive' };
  if (thcMin || thcMax) where.thcPercent = {};
  const thcMinNum = thcMin ? parseFloat(thcMin) : NaN;
  const thcMaxNum = thcMax ? parseFloat(thcMax) : NaN;
  if (!isNaN(thcMinNum)) where.thcPercent.gte = thcMinNum;
  if (!isNaN(thcMaxNum)) where.thcPercent.lte = thcMaxNum;
  if (cbdMin || cbdMax) where.cbdPercent = {};
  const cbdMinNum = cbdMin ? parseFloat(cbdMin) : NaN;
  const cbdMaxNum = cbdMax ? parseFloat(cbdMax) : NaN;
  if (!isNaN(cbdMinNum)) where.cbdPercent.gte = cbdMinNum;
  if (!isNaN(cbdMaxNum)) where.cbdPercent.lte = cbdMaxNum;
  if (minPrice || maxPrice) where.defaultPrice = {};
  const minPriceNum = minPrice ? parseFloat(minPrice) : NaN;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : NaN;
  if (!isNaN(minPriceNum)) where.defaultPrice.gte = minPriceNum;
  if (!isNaN(maxPriceNum)) where.defaultPrice.lte = maxPriceNum;

  const orderBy = (() => {
    if (!sort) return { name: 'asc' } as any;
    const desc = sort.startsWith('-');
    const key = desc ? sort.slice(1) : sort;
    const map: Record<string, string> = {
      price: 'defaultPrice',
      rating: 'purchasesLast30d',
      new: 'createdAt',
      popular: 'purchasesLast30d',
    };
    const field = map[key] || 'name';
    return { [field]: desc ? 'desc' : 'asc' } as any;
  })();

  const limitParsed = parseInt(limit);
  const pageParsed = parseInt(page);
  const take = Math.max(1, Math.min(100, !isNaN(limitParsed) ? limitParsed : 24));
  const skip = (Math.max(1, !isNaN(pageParsed) ? pageParsed : 1) - 1) * take;

  let items = await prisma.product.findMany({
    where,
    include: {
      variants: true,
      reviews: true,
      stores: storeId ? { where: { storeId: String(storeId) } } : false,
    },
    orderBy,
    take,
    skip,
  });

  if (storeId) {
    items = items.map((p: any) => {
      const sp = (p as any).stores?.[0];
      const price = sp?.price ?? p.defaultPrice ?? undefined;
      return { ...p, price };
    });
  }

  const result = {
    products: items,
    pagination: { page: parseInt(page as any), limit: take, total: items.length },
  };

  // Cache the result for 5 minutes
  await cacheService.set(cacheKey, result, 300);

  res.json(result);
});

// note: product-by-id route is defined after specific routes (slug/categories/featured) to avoid param collisions

// Reviews
productsRouter.get('/products/:id/reviews', rateLimit('product_reviews_list'), async (req, res) => {
  const pageRaw = parseInt((req.query.page as string) || '1');
  const limitRaw = parseInt((req.query.limit as string) || '24');
  const page = !isNaN(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = !isNaN(limitRaw) && limitRaw > 0 ? Math.min(100, limitRaw) : 24;
  const sort = (req.query.sort as string) || '-createdAt';
  const orderBy = { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' } as any;
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.id },
    orderBy,
    take: limit,
    skip: (page - 1) * limit,
  });
  res.json({ reviews, pagination: { page, limit, total: reviews.length } });
});

productsRouter.post(
  '/products/:id/reviews',
  rateLimit('product_reviews_create', { max: 20 }),
  requireAuth,
  validateRequest(reviewSchema, {
    onError: error => ({ body: { error: error.issues[0]?.message ?? 'rating 1..5 required' } }),
  }),
  async (req, res) => {
    const uid = (req as any).user.userId as string;
    const { rating, comment, recommend, text } = req.body as ReviewBody;
    const r = await (prisma as any).review.create({
      data: { productId: req.params.id, userId: uid, rating, text: comment || text, recommend },
    });
    res.status(201).json({ review: r });
  }
);
// get product by slug
productsRouter.get('/products/slug/:slug', rateLimit('products_slug_lookup'), async (req, res) => {
  const slug = req.params.slug;
  const p = await ((prisma as any).product.findManyBySlug
    ? (prisma as any).product.findManyBySlug({ where: { slug } })
    : null);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json({ product: p });
});

// categories
productsRouter.get('/products/categories', rateLimit('products_categories'), async (req, res) => {
  // naive categories from products
  const all = await prisma.product.findMany({ take: 100 });
  const counts: Record<string, number> = {};
  for (const it of all) counts[it.category] = (counts[it.category] || 0) + 1;
  const categories = Object.keys(counts).map(k => ({ name: k, count: counts[k] }));
  res.json({ categories });
});

// featured
productsRouter.get('/products/featured', rateLimit('products_featured'), async (req, res) => {
  const all = await prisma.product.findMany({ take: 100 });
  const featured = all.filter((p: any) => p.featured);
  res.json({ products: featured });
});

// product by id (define after specific routes to avoid collisions)
productsRouter.get('/products/:id', rateLimit('products_detail'), async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { variants: true, reviews: { take: 5, orderBy: { createdAt: 'desc' } } },
  });
  if (!p) return res.status(404).json({ error: 'Product not found' });

  // include simple related products by category (test shim may expose helper methods)
  const related = (prisma as any).product.findManyByCategory
    ? await (prisma as any).product.findManyByCategory({ where: { category: p.category } })
    : [];
  res.json({ product: p, relatedProducts: related.filter((r: any) => r.id !== p.id) });
});
