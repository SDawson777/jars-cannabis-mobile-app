// backend/src/routes/favorites.ts
// Favorites and quick reorder routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Favorites Routes
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type: _type, folderId: _folderId } = req.query;

    res.json({
      favorites: [
        {
          id: 'fav-1',
          itemId: 'prod-1',
          itemType: 'product',
          userId: 'user-123',
          folderId: null,
          notes: 'Great for relaxation',
          addedAt: new Date().toISOString(),
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    res.json({
      products: [
        {
          id: 'fav-1',
          itemId: 'prod-1',
          itemType: 'product',
          product: {
            id: 'prod-1',
            name: 'Blue Dream',
            brand: 'Nimbus Farms',
            category: 'Flower',
            price: 45,
            image: 'https://example.com/blue-dream.jpg',
            thcContent: '22%',
            cbdContent: '0.1%',
            inStock: true,
          },
          addedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    res.status(500).json({ error: 'Failed to fetch favorite products' });
  }
});

router.get('/check/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    // Mock - in production, check user's favorites
    res.json({ isFavorite: productId === 'prod-1' });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { itemId, itemType, folderId, notes } = req.body;
    res.status(201).json({
      id: `fav-${Date.now()}`,
      itemId,
      itemType,
      userId: 'user-123',
      folderId: folderId || null,
      notes: notes || null,
      addedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:itemId', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.patch('/:favoriteId', async (req: Request, res: Response) => {
  try {
    const { favoriteId } = req.params;
    const updates = req.body;
    res.json({
      id: favoriteId,
      ...updates,
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

router.get('/folders', async (req: Request, res: Response) => {
  try {
    res.json({
      folders: [
        {
          id: 'folder-1',
          name: 'Relaxation',
          color: '#7C3AED',
          icon: 'moon',
          itemCount: 5,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'folder-2',
          name: 'Energy',
          color: '#F59E0B',
          icon: 'lightning',
          itemCount: 3,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

router.post('/folders', async (req: Request, res: Response) => {
  try {
    const folder = req.body;
    res.status(201).json({
      id: `folder-${Date.now()}`,
      ...folder,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.delete('/folders/:folderId', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

router.post('/folders/:folderId/move', async (req: Request, res: Response) => {
  try {
    const { favoriteIds: _favoriteIds } = req.body;
    res.json({ moved: _favoriteIds.length });
  } catch (error) {
    console.error('Error moving favorites:', error);
    res.status(500).json({ error: 'Failed to move favorites' });
  }
});

// ============================================
// Quick Reorder Routes
// ============================================

router.get('/frequently-ordered', async (req: Request, res: Response) => {
  try {
    res.json({
      products: [
        {
          id: 'prod-1',
          name: 'Blue Dream',
          brand: 'Nimbus Farms',
          price: 45,
          image: 'https://example.com/blue-dream.jpg',
          orderCount: 5,
          lastOrdered: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching frequently ordered:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/past-orders', async (req: Request, res: Response) => {
  try {
    res.json({
      orders: [
        {
          id: 'order-1',
          orderNumber: 'NMB-2024-001',
          status: 'delivered',
          total: 125.5,
          itemCount: 3,
          items: [{ productId: 'prod-1', name: 'Blue Dream', quantity: 1, price: 45 }],
          createdAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching past orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/last-order', async (req: Request, res: Response) => {
  try {
    res.json({
      id: 'order-1',
      orderNumber: 'NMB-2024-001',
      status: 'delivered',
      total: 125.5,
      itemCount: 3,
      items: [{ productId: 'prod-1', name: 'Blue Dream', quantity: 1, price: 45 }],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching last order:', error);
    res.status(500).json({ error: 'Failed to fetch last order' });
  }
});

router.post('/reorder/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId: _orderId } = req.params;
    res.json({
      cartId: 'cart-123',
      addedItems: [{ productId: 'prod-1', name: 'Blue Dream', quantity: 1 }],
      unavailableItems: [],
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

router.post('/quick-add', async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    res.json({
      cartId: 'cart-123',
      item: { productId, quantity },
    });
  } catch (error) {
    console.error('Error quick adding:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.post('/bulk-add', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    res.json({
      cartId: 'cart-123',
      addedItems: items,
      unavailableItems: [],
    });
  } catch (error) {
    console.error('Error bulk adding:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// ============================================
// Special Collections
// ============================================

router.get('/on-sale', async (req: Request, res: Response) => {
  try {
    res.json({ products: [] });
  } catch (error) {
    console.error('Error fetching favorites on sale:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/back-in-stock', async (req: Request, res: Response) => {
  try {
    res.json({ products: [] });
  } catch (error) {
    console.error('Error fetching back in stock:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================
// Sharing
// ============================================

router.post('/share', async (req: Request, res: Response) => {
  try {
    const { favoriteIds: _favoriteIds, expiresInDays } = req.body;
    res.json({
      shareId: `share-${Date.now()}`,
      shareUrl: `https://nimbus.app/shared/favorites/${Date.now()}`,
      expiresAt: new Date(Date.now() + (expiresInDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error sharing favorites:', error);
    res.status(500).json({ error: 'Failed to share' });
  }
});

export default router;
