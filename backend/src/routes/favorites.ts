// backend/src/routes/favorites.ts
// Favorites and quick reorder routes - Database-backed implementation

import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Favorites Routes
// ============================================

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { folderId, cursor, limit = '20' } = req.query;

  try {
    const take = Math.min(parseInt(limit as string) || 20, 100);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: uid,
        ...(folderId ? { folderId: String(folderId) } : {}),
      },
      include: {
        folder: true,
      },
      orderBy: { addedAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: String(cursor) }, skip: 1 } : {}),
    });

    const hasMore = favorites.length > take;
    const items = hasMore ? favorites.slice(0, take) : favorites;

    res.json({
      favorites: items.map(f => ({
        id: f.id,
        itemId: f.productId,
        itemType: 'product',
        userId: f.userId,
        folderId: f.folderId,
        folderName: f.folder?.name || null,
        notes: f.notes,
        addedAt: f.addedAt.toISOString(),
      })),
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.get('/products', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: uid },
      orderBy: { addedAt: 'desc' },
    });

    // Fetch associated products
    const productIds = favorites.map(f => f.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        stores: {
          where: { active: true },
          take: 1,
          select: { price: true, stock: true },
        },
      },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    res.json({
      products: favorites
        .map(f => {
          const product = productMap.get(f.productId);
          return {
            id: f.id,
            itemId: f.productId,
            itemType: 'product',
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  brand: product.brand || 'Unknown',
                  category: product.category,
                  price: product.stores[0]?.price || product.defaultPrice || 0,
                  image: 'https://placehold.co/200', // Image URL would come from CMS
                  thcContent: product.thcPercent ? `${product.thcPercent}%` : null,
                  cbdContent: product.cbdPercent ? `${product.cbdPercent}%` : null,
                  inStock: (product.stores[0]?.stock ?? 0) > 0,
                }
              : null,
            addedAt: f.addedAt.toISOString(),
          };
        })
        .filter(f => f.product !== null),
    });
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    res.status(500).json({ error: 'Failed to fetch favorite products' });
  }
});

router.get('/check/:productId', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { productId } = req.params;

  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: uid, productId },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { itemId, folderId, notes } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'itemId is required' });
  }

  try {
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: { userId: uid, productId: itemId },
      },
      update: {
        folderId: folderId || null,
        notes: notes || null,
      },
      create: {
        userId: uid,
        productId: itemId,
        folderId: folderId || null,
        notes: notes || null,
      },
    });

    res.status(201).json({
      id: favorite.id,
      itemId: favorite.productId,
      itemType: 'product',
      userId: favorite.userId,
      folderId: favorite.folderId,
      notes: favorite.notes,
      addedAt: favorite.addedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:itemId', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { itemId } = req.params;

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: uid,
        productId: itemId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.patch('/:favoriteId', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { favoriteId } = req.params;
  const { folderId, notes } = req.body;

  try {
    const favorite = await prisma.favorite.updateMany({
      where: {
        id: favoriteId,
        userId: uid,
      },
      data: {
        ...(folderId !== undefined ? { folderId } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    if (favorite.count === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    const updated = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    res.json({
      id: updated?.id,
      folderId: updated?.folderId,
      notes: updated?.notes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// ============================================
// Folders Routes
// ============================================

router.get('/folders', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    const folders = await prisma.favoriteFolder.findMany({
      where: { userId: uid },
      include: {
        _count: {
          select: { favorites: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      folders: folders.map(f => ({
        id: f.id,
        name: f.name,
        color: f.color,
        icon: f.icon,
        itemCount: f._count.favorites,
        createdAt: f.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

router.post('/folders', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { name, color, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const folder = await prisma.favoriteFolder.create({
      data: {
        userId: uid,
        name,
        color: color || '#7C3AED',
        icon: icon || 'star',
      },
    });

    res.status(201).json({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      itemCount: 0,
      createdAt: folder.createdAt.toISOString(),
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A folder with this name already exists' });
    }
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.delete('/folders/:folderId', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { folderId } = req.params;

  try {
    // First unassign all favorites from this folder
    await prisma.favorite.updateMany({
      where: { folderId, userId: uid },
      data: { folderId: null },
    });

    // Then delete the folder
    await prisma.favoriteFolder.deleteMany({
      where: { id: folderId, userId: uid },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

router.post('/folders/:folderId/move', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { folderId } = req.params;
  const { favoriteIds } = req.body;

  if (!Array.isArray(favoriteIds)) {
    return res.status(400).json({ error: 'favoriteIds must be an array' });
  }

  try {
    const result = await prisma.favorite.updateMany({
      where: {
        id: { in: favoriteIds },
        userId: uid,
      },
      data: {
        folderId: folderId === 'none' ? null : folderId,
      },
    });

    res.json({ moved: result.count });
  } catch (error) {
    console.error('Error moving favorites:', error);
    res.status(500).json({ error: 'Failed to move favorites' });
  }
});

// ============================================
// Quick Reorder Routes - Query from Order history
// ============================================

router.get('/frequently-ordered', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    // Get products from user's order history, grouped by frequency
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { userId: uid },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            defaultPrice: true,
          },
        },
        order: {
          select: { createdAt: true },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    // Aggregate by product
    const productCounts = new Map<string, { product: any; count: number; lastOrdered: Date }>();
    for (const item of orderItems) {
      const existing = productCounts.get(item.productId);
      if (existing) {
        existing.count += item.quantity;
        if (item.order.createdAt > existing.lastOrdered) {
          existing.lastOrdered = item.order.createdAt;
        }
      } else {
        productCounts.set(item.productId, {
          product: item.product,
          count: item.quantity,
          lastOrdered: item.order.createdAt,
        });
      }
    }

    // Sort by count and take top 10
    const sorted = Array.from(productCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      products: sorted.map(({ product, count, lastOrdered }) => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Unknown',
        price: product.defaultPrice || 0,
        image: 'https://placehold.co/200',
        orderCount: count,
        lastOrdered: lastOrdered.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching frequently ordered:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/past-orders', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { cursor, limit = '10' } = req.query;

  try {
    const take = Math.min(parseInt(limit as string) || 10, 50);

    const orders = await prisma.order.findMany({
      where: { userId: uid },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: String(cursor) }, skip: 1 } : {}),
    });

    const hasMore = orders.length > take;
    const items = hasMore ? orders.slice(0, take) : orders;

    res.json({
      orders: items.map(order => ({
        id: order.id,
        orderNumber: `NMB-${order.createdAt.getFullYear()}-${order.id.slice(-6).toUpperCase()}`,
        status: order.status.toLowerCase(),
        total: order.total || 0,
        itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
        items: order.items.map(i => ({
          productId: i.productId,
          name: i.product.name,
          quantity: i.quantity,
          price: i.unitPrice || 0,
        })),
        createdAt: order.createdAt.toISOString(),
      })),
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
    });
  } catch (error) {
    console.error('Error fetching past orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/last-order', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    const order = await prisma.order.findFirst({
      where: { userId: uid },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      return res.status(404).json({ error: 'No orders found' });
    }

    res.json({
      id: order.id,
      orderNumber: `NMB-${order.createdAt.getFullYear()}-${order.id.slice(-6).toUpperCase()}`,
      status: order.status.toLowerCase(),
      total: order.total || 0,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      items: order.items.map(i => ({
        productId: i.productId,
        name: i.product.name,
        quantity: i.quantity,
        price: i.unitPrice || 0,
      })),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching last order:', error);
    res.status(500).json({ error: 'Failed to fetch last order' });
  }
});

router.post('/reorder/:orderId', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { orderId } = req.params;

  try {
    // Get the original order
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: uid },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: uid },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: uid,
          storeId: order.storeId,
        },
      });
    }

    // Add items to cart
    const addedItems = [];
    const unavailableItems = [];

    for (const item of order.items) {
      // Check if product is available
      const storeProduct = await prisma.storeProduct.findFirst({
        where: {
          productId: item.productId,
          active: true,
          stock: { gt: 0 },
        },
      });

      if (storeProduct) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId || '',
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
        addedItems.push({
          productId: item.productId,
          name: item.product.name,
          quantity: item.quantity,
        });
      } else {
        unavailableItems.push({
          productId: item.productId,
          name: item.product.name,
          reason: 'Out of stock',
        });
      }
    }

    res.json({
      cartId: cart.id,
      addedItems,
      unavailableItems,
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

router.post('/quick-add', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: uid },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: uid },
      });
    }

    // Get product price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { defaultPrice: true },
    });

    // Add to cart
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: '',
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: product?.defaultPrice,
      },
    });

    res.json({
      cartId: cart.id,
      item: { productId, quantity },
    });
  } catch (error) {
    console.error('Error quick adding:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.post('/bulk-add', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }

  try {
    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: uid },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: uid },
      });
    }

    const addedItems = [];
    const unavailableItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, defaultPrice: true },
      });

      if (product) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: item.productId,
              variantId: '',
            },
          },
          update: {
            quantity: { increment: item.quantity || 1 },
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            unitPrice: product.defaultPrice,
          },
        });
        addedItems.push({
          productId: item.productId,
          name: product.name,
          quantity: item.quantity || 1,
        });
      } else {
        unavailableItems.push({
          productId: item.productId,
          reason: 'Product not found',
        });
      }
    }

    res.json({
      cartId: cart.id,
      addedItems,
      unavailableItems,
    });
  } catch (error) {
    console.error('Error bulk adding:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// ============================================
// Special Collections - Query from Favorites + Products
// ============================================

router.get('/on-sale', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    // Get user's favorite product IDs (used for filtering in production)
    const _favorites = await prisma.favorite.findMany({
      where: { userId: uid },
      select: { productId: true },
    });

    // In a real implementation, we'd check for products with active sales/discounts
    // For now, return empty as this requires a Deal/Promotion table
    res.json({ products: [] });
  } catch (error) {
    console.error('Error fetching favorites on sale:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/back-in-stock', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    // Get user's favorites with stock info
    const favorites = await prisma.favorite.findMany({
      where: { userId: uid },
      select: { productId: true },
    });

    const productIds = favorites.map(f => f.productId);

    // Find products that have stock > 0 (would need historical tracking for "back in stock")
    // For now, return products that are in stock
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        stores: {
          some: { stock: { gt: 0 }, active: true },
        },
      },
      include: {
        stores: {
          where: { active: true },
          take: 1,
          select: { price: true, stock: true },
        },
      },
    });

    res.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'Unknown',
        price: p.stores[0]?.price || p.defaultPrice || 0,
        image: 'https://placehold.co/200',
        inStock: true,
      })),
    });
  } catch (error) {
    console.error('Error fetching back in stock:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================
// Sharing - Generates shareable link
// ============================================

router.post('/share', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { favoriteIds: _favoriteIds, expiresInDays = 7 } = req.body;

  try {
    // In production, would create a ShareLink record in database
    const shareId = `share-${uid.slice(-6)}-${Date.now().toString(36)}`;

    res.json({
      shareId,
      shareUrl: `https://nimbus.app/shared/favorites/${shareId}`,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error sharing favorites:', error);
    res.status(500).json({ error: 'Failed to share' });
  }
});

export default router;
