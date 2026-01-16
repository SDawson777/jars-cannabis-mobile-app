// backend/src/routes/inventory.ts
// Real-time inventory management and back-in-stock notifications

import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';

export const inventoryRouter = Router();

/**
 * GET /inventory/:productId
 * Get real-time inventory status for a product
 */
inventoryRouter.get('/inventory/:productId', optionalAuth, async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { storeId } = req.query;

  try {
    // In production, query live inventory system
    // For demo, return mock data
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Mock inventory data
    const quantity = Math.floor(Math.random() * 50) + 5;
    const lowStockThreshold = 10;

    res.json({
      productId,
      storeId: storeId || 'default',
      quantity,
      available: quantity > 0,
      lowStock: quantity <= lowStockThreshold,
      reservedQuantity: Math.floor(Math.random() * 5),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Inventory check error:', error);
    res.status(500).json({ error: 'Failed to check inventory' });
  }
});

/**
 * GET /inventory/:productId/stores
 * Get product availability across stores
 */
inventoryRouter.get(
  '/inventory/:productId/stores',
  optionalAuth,
  async (req: Request, res: Response) => {
    const { productId: _productId } = req.params;
    const { lat, lng } = req.query;

    try {
      // Mock store availability data
      const stores = [
        {
          storeId: 'store-1',
          storeName: 'Nimbus Downtown',
          address: '123 Main St, San Francisco, CA',
          distance: lat && lng ? 1.2 : undefined,
          available: true,
          quantity: 15,
          lowStock: false,
          pickupAvailable: true,
          deliveryAvailable: true,
        },
        {
          storeId: 'store-2',
          storeName: 'Nimbus Mission',
          address: '456 Valencia St, San Francisco, CA',
          distance: lat && lng ? 2.5 : undefined,
          available: true,
          quantity: 8,
          lowStock: true,
          pickupAvailable: true,
          deliveryAvailable: true,
        },
        {
          storeId: 'store-3',
          storeName: 'Nimbus Oakland',
          address: '789 Broadway, Oakland, CA',
          distance: lat && lng ? 5.8 : undefined,
          available: false,
          quantity: 0,
          lowStock: false,
          pickupAvailable: true,
          deliveryAvailable: false,
        },
      ];

      // Sort by distance if coordinates provided
      if (lat && lng) {
        stores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      res.json({ stores });
    } catch (error) {
      console.error('Store availability error:', error);
      res.status(500).json({ error: 'Failed to check store availability' });
    }
  }
);

/**
 * GET /inventory/back-in-stock
 * Get user's back-in-stock subscriptions
 */
inventoryRouter.get(
  '/inventory/back-in-stock',
  requireAuth,
  async (req: Request, res: Response) => {
    const _userId = (req as any).user?.userId;

    try {
      // In production, query from database
      // For demo, return mock data
      res.json({
        subscriptions: [
          {
            id: 'sub-1',
            productId: 'prod-123',
            productName: 'Blue Dream Cartridge',
            storeId: 'store-1',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            notified: false,
          },
        ],
      });
    } catch (error) {
      console.error('Back-in-stock fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  }
);

/**
 * POST /inventory/back-in-stock/subscribe
 * Subscribe to back-in-stock notification
 */
inventoryRouter.post(
  '/inventory/back-in-stock/subscribe',
  requireAuth,
  async (req: Request, res: Response) => {
    const _userId = (req as any).user?.userId;
    const { productId, storeId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    try {
      // In production, store in database
      const subscription = {
        id: `sub-${Date.now()}`,
        productId,
        storeId,
        createdAt: new Date().toISOString(),
        notified: false,
      };

      res.status(201).json(subscription);
    } catch (error) {
      console.error('Back-in-stock subscribe error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  }
);

/**
 * POST /inventory/back-in-stock/:id/unsubscribe
 * Unsubscribe from back-in-stock notification
 */
inventoryRouter.post(
  '/inventory/back-in-stock/:id/unsubscribe',
  requireAuth,
  async (req: Request, res: Response) => {
    const { id: _id } = req.params;

    try {
      // In production, delete from database
      res.json({ success: true });
    } catch (error) {
      console.error('Back-in-stock unsubscribe error:', error);
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  }
);

/**
 * POST /inventory/reserve
 * Reserve inventory for cart
 */
inventoryRouter.post('/inventory/reserve', requireAuth, async (req: Request, res: Response) => {
  const { productId, quantity, storeId } = req.body;

  if (!productId || !quantity || !storeId) {
    return res.status(400).json({ error: 'productId, quantity, and storeId are required' });
  }

  try {
    // In production, create reservation with expiry
    const reservation = {
      reservationId: `res-${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    };

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Inventory reserve error:', error);
    res.status(500).json({ error: 'Failed to reserve inventory' });
  }
});

export default inventoryRouter;
