import { Router } from 'express';
import { prisma } from '../prismaClient';

export const homeRouter = Router();

// Category emoji mapping for display
const categoryEmojis: Record<string, string> = {
  Flower: '🌿',
  flower: '🌿',
  Vape: '💨',
  vapes: '💨',
  Edibles: '🍪',
  edibles: '🍪',
  PreRoll: '🚬',
  'pre-rolls': '🚬',
  Concentrate: '🛢️',
  concentrates: '🛢️',
  Gear: '🧰',
  gear: '🧰',
  Topical: '🧴',
  topicals: '🧴',
  Tincture: '💧',
  tinctures: '💧',
  Beverage: '🥤',
  beverages: '🥤',
  Other: '📦',
};

/**
 * GET /home/categories
 * Returns product categories from database
 */
homeRouter.get('/home/categories', async (_req, res) => {
  try {
    // Get distinct categories from products table
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    const categories = products
      .map(p => p.category)
      .filter(c => c !== null && c !== undefined)
      .map(category => ({
        id: String(category).toLowerCase().replace(/\s+/g, '-'),
        label: String(category),
        emoji: categoryEmojis[String(category)] || '📦',
      }));

    // Return categories or fallback to defaults
    if (categories.length > 0) {
      res.json(categories);
    } else {
      // Fallback to defaults if DB is empty
      res.json([
        { id: 'flower', label: 'Flower', emoji: '🌿' },
        { id: 'vapes', label: 'Vapes', emoji: '💨' },
        { id: 'edibles', label: 'Edibles', emoji: '🍪' },
        { id: 'pre-rolls', label: 'Pre-rolls', emoji: '🚬' },
        { id: 'concentrates', label: 'Concentrates', emoji: '🛢️' },
        { id: 'gear', label: 'Gear', emoji: '🧰' },
      ]);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback on error
    res.json([
      { id: 'flower', label: 'Flower', emoji: '🌿' },
      { id: 'vapes', label: 'Vapes', emoji: '💨' },
      { id: 'edibles', label: 'Edibles', emoji: '🍪' },
      { id: 'pre-rolls', label: 'Pre-rolls', emoji: '🚬' },
      { id: 'concentrates', label: 'Concentrates', emoji: '🛢️' },
      { id: 'gear', label: 'Gear', emoji: '🧰' },
    ]);
  }
});

/**
 * GET /home/featured
 * Returns featured/popular products from database
 */
homeRouter.get('/home/featured', async (_req, res) => {
  try {
    // Get popular products based on purchasesLast30d
    const featuredProducts = await prisma.product.findMany({
      take: 6,
      orderBy: { purchasesLast30d: 'desc' },
      select: {
        id: true,
        name: true,
        defaultPrice: true,
        description: true,
        brand: true,
      },
    });

    if (featuredProducts.length > 0) {
      const formatted = featuredProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.defaultPrice || 0,
        image: 'https://placehold.co/200', // Placeholder since images not in schema
        description: p.description || '',
        brand: p.brand || '',
      }));
      res.json(formatted);
    } else {
      // Fallback: get recent products if no popular ones
      const recentProducts = await prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          defaultPrice: true,
          description: true,
          brand: true,
        },
      });

      const formatted = recentProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.defaultPrice || 0,
        image: 'https://placehold.co/200',
        description: p.description || '',
        brand: p.brand || '',
      }));
      res.json(formatted);
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.json([]);
  }
});

/**
 * GET /home/ways
 * Returns ways to shop options
 */
homeRouter.get('/home/ways', async (_req, res) => {
  // Ways to shop are relatively static but could be CMS-driven
  // For now, include all main shopping pathways
  res.json([
    { id: 'deals', label: 'Shop Deals', icon: '🏷️' },
    { id: 'popular', label: 'Shop Popular', icon: '🔥' },
    { id: 'effects', label: 'Shop by Effects', icon: '✨' },
    { id: 'new', label: 'New Arrivals', icon: '🆕' },
    { id: 'brands', label: 'Shop Brands', icon: '🏢' },
  ]);
});
