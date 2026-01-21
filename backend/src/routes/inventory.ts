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
      // Get all active stores from database
      // TODO: When StoreInventory table is available, filter by _productId
      const dbStores = await prisma.store.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          address1: true,
          address2: true,
          city: true,
          state: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      });

      // Calculate distance if coordinates provided
      const userLat = lat ? parseFloat(lat as string) : null;
      const userLng = lng ? parseFloat(lng as string) : null;

      const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number | null,
        lon2: number | null
      ): number => {
        if (lat2 === null || lon2 === null) return 999;
        const R = 3959; // miles
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      // Build store availability response
      // In production, query actual inventory per store
      const stores = dbStores.map(store => {
        // Simulated inventory - in production, query StoreInventory table
        const quantity = Math.floor(Math.random() * 20);
        const lowStockThreshold = 5;

        // Build address string from components
        const addressParts = [
          store.address1,
          store.address2,
          store.city,
          store.state,
          store.postalCode,
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        // Convert Decimal to number for distance calculation
        const lat = store.latitude ? Number(store.latitude) : null;
        const lng = store.longitude ? Number(store.longitude) : null;

        return {
          storeId: store.id,
          storeName: store.name,
          address: fullAddress,
          distance:
            userLat && userLng && lat && lng
              ? Math.round(calculateDistance(userLat, userLng, lat, lng) * 10) / 10
              : undefined,
          available: quantity > 0,
          quantity,
          lowStock: quantity > 0 && quantity <= lowStockThreshold,
          pickupAvailable: true, // TODO: Add pickupEnabled field to Store schema if needed
          deliveryAvailable: true, // TODO: Add deliveryEnabled field to Store schema if needed
        };
      });

      // Sort by distance if coordinates provided
      if (userLat && userLng) {
        stores.sort((a, b) => (a.distance || 999) - (b.distance || 999));
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
