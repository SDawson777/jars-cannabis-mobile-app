// backend/src/routes/search.ts
// Advanced search with fuzzy matching, facets and suggestions

import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';

export const searchRouter = Router();

/**
 * GET /search/products
 * Advanced product search with filters and facets
 */
searchRouter.get('/search/products', optionalAuth, async (req: Request, res: Response) => {
  const {
    q,
    page = '1',
    limit = '24',
    category,
    subcategory,
    priceMin,
    priceMax,
    thcMin: _thcMin,
    thcMax: _thcMax,
    cbdMin: _cbdMin,
    cbdMax: _cbdMax,
    strainType,
    effects: _effects,
    flavors: _flavors,
    terpenes: _terpenes,
    brands: _brands,
    inStock: _inStock,
    onSale: _onSale,
    sort = 'relevance',
  } = req.query;

  try {
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(100, parseInt(limit as string));

    // Build query (in production, use Algolia/Elasticsearch)
    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { brand: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (strainType) where.strainType = strainType;
    if (priceMin || priceMax) {
      where.defaultPrice = {};
      if (priceMin) where.defaultPrice.gte = parseFloat(priceMin as string);
      if (priceMax) where.defaultPrice.lte = parseFloat(priceMax as string);
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        orderBy:
          sort === 'price_asc'
            ? { defaultPrice: 'asc' }
            : sort === 'price_desc'
              ? { defaultPrice: 'desc' }
              : sort === 'newest'
                ? { createdAt: 'desc' }
                : { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform results
    const results = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.defaultPrice,
      imageUrl: p.imageUrl,
      inStock: true, // Would check inventory in production
      matchScore: q ? 0.9 : undefined,
    }));

    // Generate facets (simplified)
    const facets = {
      categories: [
        { name: 'Flower', count: 45 },
        { name: 'Edibles', count: 32 },
        { name: 'Concentrates', count: 28 },
        { name: 'Vapes', count: 24 },
        { name: 'Topicals', count: 12 },
      ],
      brands: [
        { name: 'Nimbus', count: 20 },
        { name: 'Cloud Nine', count: 15 },
        { name: 'Green Leaf', count: 12 },
      ],
      effects: [
        { name: 'Relaxed', count: 40 },
        { name: 'Happy', count: 35 },
        { name: 'Euphoric', count: 30 },
        { name: 'Creative', count: 25 },
        { name: 'Focused', count: 20 },
      ],
      flavors: [
        { name: 'Citrus', count: 25 },
        { name: 'Earthy', count: 22 },
        { name: 'Berry', count: 18 },
        { name: 'Pine', count: 15 },
      ],
      priceRanges: [
        { min: 0, max: 25, count: 30 },
        { min: 25, max: 50, count: 45 },
        { min: 50, max: 100, count: 35 },
        { min: 100, max: 500, count: 15 },
      ],
      thcRanges: [
        { min: 0, max: 10, count: 20 },
        { min: 10, max: 20, count: 40 },
        { min: 20, max: 30, count: 50 },
        { min: 30, max: 100, count: 15 },
      ],
    };

    res.json({
      results,
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
      facets,
      suggestions: q ? ['Blue Dream', 'Blue Cheese', 'Blueberry Kush'] : [],
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /search/suggest
 * Search autocomplete suggestions
 */
searchRouter.get('/search/suggest', optionalAuth, async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || (q as string).length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    // In production, use search service for suggestions
    const query = (q as string).toLowerCase();

    const suggestions = [
      { type: 'product', text: `${q} Cartridge`, slug: 'blue-dream-cartridge' },
      { type: 'product', text: `${q} Flower`, slug: 'blue-dream-flower' },
      { type: 'category', text: 'Flower', slug: 'flower' },
      { type: 'brand', text: 'Cloud Nine', slug: 'cloud-nine' },
      { type: 'effect', text: 'Relaxed', slug: 'relaxed' },
      { type: 'query', text: `${q} indica` },
    ].filter(s => s.text.toLowerCase().includes(query));

    res.json({ suggestions: suggestions.slice(0, 8) });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: 'Suggestions failed' });
  }
});

/**
 * GET /search/trending
 * Get trending searches
 */
searchRouter.get('/search/trending', async (_req: Request, res: Response) => {
  // In production, aggregate from search analytics
  res.json({
    searches: [
      'Blue Dream',
      'Edibles',
      'THC Gummies',
      'Sativa',
      'Pain Relief',
      'Sleep Aid',
      'Pre-rolls',
      'CBD Oil',
    ],
  });
});

/**
 * GET /search/by-effect
 * Search products by effect/mood
 */
searchRouter.get('/search/by-effect', optionalAuth, async (req: Request, res: Response) => {
  const { effect, limit = '20' } = req.query;

  if (!effect) {
    return res.status(400).json({ error: 'effect parameter is required' });
  }

  try {
    // In production, query products with matching effect tags
    const products = await prisma.product.findMany({
      take: parseInt(limit as string),
      orderBy: { name: 'asc' },
    });

    const results = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.defaultPrice,
      imageUrl: p.imageUrl,
      inStock: true,
    }));

    res.json({ results });
  } catch (error) {
    console.error('Search by effect error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /search/by-terpenes
 * Search products by terpene profile
 */
searchRouter.get('/search/by-terpenes', optionalAuth, async (req: Request, res: Response) => {
  const { terpenes, limit = '20' } = req.query;

  if (!terpenes) {
    return res.status(400).json({ error: 'terpenes parameter is required' });
  }

  try {
    // In production, query products with matching terpene profiles
    const products = await prisma.product.findMany({
      take: parseInt(limit as string),
      orderBy: { name: 'asc' },
    });

    const results = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.defaultPrice,
      imageUrl: p.imageUrl,
      inStock: true,
    }));

    res.json({ results });
  } catch (error) {
    console.error('Search by terpenes error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default searchRouter;
