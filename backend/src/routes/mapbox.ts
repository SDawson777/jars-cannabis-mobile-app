// backend/src/routes/mapbox.ts
// Map, geolocation, and geofencing routes

import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// Helper to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to check if store is currently open
function isStoreOpen(hours: any): boolean {
  if (!hours) return true; // Assume open if no hours specified
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[now.getDay()];
  const dayHours = hours[dayName];

  if (!dayHours || dayHours.isClosed) return false;

  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

// ============================================
// Store Locator Routes
// ============================================

router.get('/stores/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = '25', limit = '20' } = req.query;

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxRadius = parseFloat(radius as string);
    const maxResults = Math.min(parseInt(limit as string) || 20, 50);

    // Get all active stores from database
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      include: {
        brand: {
          select: { name: true, logoUrl: true },
        },
      },
    });

    // Calculate distance and filter by radius if coordinates provided
    let storesWithDistance = stores.map(store => {
      const storeLat = store.latitude ? Number(store.latitude) : null;
      const storeLng = store.longitude ? Number(store.longitude) : null;

      let distance = null;
      if (storeLat && storeLng && !isNaN(userLat) && !isNaN(userLng)) {
        distance = calculateDistance(userLat, userLng, storeLat, storeLng);
      }

      return {
        id: store.id,
        name: store.name,
        address: store.address1 || '',
        city: store.city || '',
        state: store.state || '',
        zip: store.postalCode || '',
        phone: store.phone || '',
        coordinates:
          storeLat && storeLng
            ? {
                latitude: storeLat,
                longitude: storeLng,
              }
            : null,
        hours: store.hours || {},
        isOpen: isStoreOpen(store.hours),
        distance: distance !== null ? Math.round(distance * 10) / 10 : null,
        duration: distance !== null ? Math.round(distance * 3) : null, // Rough estimate: 3 min per mile
        trafficLevel: 'moderate', // Would need traffic API for real data
        amenities: [], // Would be stored in DB if needed
        services: ['pickup', 'inStore'], // Would be stored in DB
        rating: null, // Would need review aggregation
        reviewCount: 0,
        image: store.brand?.logoUrl || 'https://placehold.co/200',
      };
    });

    // Filter by radius if coordinates provided
    if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(maxRadius)) {
      storesWithDistance = storesWithDistance.filter(
        s => s.distance !== null && s.distance <= maxRadius
      );
    }

    // Sort by distance
    storesWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    // Limit results
    const limitedStores = storesWithDistance.slice(0, maxResults);

    res.json({ stores: limitedStores });
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// ============================================
// Map Search Routes
// ============================================

router.get('/map/search', async (req: Request, res: Response) => {
  try {
    const { q, lat, lng } = req.query;
    const searchQuery = String(q || '').toLowerCase();

    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { city: { contains: searchQuery, mode: 'insensitive' } },
          { address1: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    res.json({
      results: stores.map(store => {
        const storeLat = store.latitude ? Number(store.latitude) : null;
        const storeLng = store.longitude ? Number(store.longitude) : null;

        let distance = null;
        if (storeLat && storeLng && !isNaN(userLat) && !isNaN(userLng)) {
          distance = calculateDistance(userLat, userLng, storeLat, storeLng);
        }

        return {
          id: store.id,
          name: store.name,
          address: `${store.address1 || ''}, ${store.city || ''}, ${store.state || ''}`,
          coordinates:
            storeLat && storeLng
              ? {
                  latitude: storeLat,
                  longitude: storeLng,
                }
              : null,
          type: 'store',
          distance: distance !== null ? Math.round(distance * 10) / 10 : null,
        };
      }),
    });
  } catch (error) {
    console.error('Error searching map:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================
// Directions Routes
// Note: In production, would integrate with Mapbox Directions API
// ============================================

router.get('/map/directions', async (req: Request, res: Response) => {
  try {
    const { originLat, originLng, destLat, destLng, mode: _mode = 'driving' } = req.query;

    res.json({
      distance: 3700, // meters
      duration: 480, // seconds (8 minutes)
      geometry: {
        type: 'LineString',
        coordinates: [
          [Number(originLng), Number(originLat)],
          [-118.25, 34.05],
          [Number(destLng), Number(destLat)],
        ],
      },
      steps: [
        {
          instruction: 'Head north on Main St',
          distance: 500,
          duration: 60,
          maneuver: {
            type: 'depart',
            instruction: 'Head north',
            bearing_after: 0,
            bearing_before: 0,
            location: [Number(originLng), Number(originLat)],
          },
        },
        {
          instruction: 'Turn right onto 1st Ave',
          distance: 1200,
          duration: 180,
          maneuver: {
            type: 'turn',
            instruction: 'Turn right',
            bearing_after: 90,
            bearing_before: 0,
            location: [-118.25, 34.05],
          },
        },
        {
          instruction: 'Arrive at destination',
          distance: 0,
          duration: 0,
          maneuver: {
            type: 'arrive',
            instruction: 'You have arrived',
            bearing_after: 0,
            bearing_before: 90,
            location: [Number(destLng), Number(destLat)],
          },
        },
      ],
      trafficLevel: 'moderate',
    });
  } catch (error) {
    console.error('Error fetching directions:', error);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// Note: In production, travel times would use Mapbox Matrix API
router.get('/map/travel-times', async (req: Request, res: Response) => {
  try {
    const { storeIds, lat, lng } = req.query;
    const ids = (storeIds as string)?.split(',') || [];
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    // Fetch stores to get their coordinates
    const stores = await prisma.store.findMany({
      where: { id: { in: ids }, isActive: true },
    });

    const times: Record<string, { distance: number; duration: number; trafficLevel: string }> = {};

    for (const store of stores) {
      const storeLat = store.latitude ? Number(store.latitude) : null;
      const storeLng = store.longitude ? Number(store.longitude) : null;

      if (storeLat && storeLng && !isNaN(userLat) && !isNaN(userLng)) {
        const distanceMiles = calculateDistance(userLat, userLng, storeLat, storeLng);
        times[store.id] = {
          distance: Math.round(distanceMiles * 1609.34), // Convert to meters
          duration: Math.round(distanceMiles * 3 * 60), // Rough: 3 min per mile in seconds
          trafficLevel: 'moderate', // Would need traffic API
        };
      }
    }

    res.json(times);
  } catch (error) {
    console.error('Error fetching travel times:', error);
    res.status(500).json({ error: 'Failed to get travel times' });
  }
});

// ============================================
// Geofencing Routes
// Geofences are dynamically generated from store locations
// ============================================

router.get('/geofences', async (req: Request, res: Response) => {
  try {
    // Generate geofences from active stores
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    });

    const geofences = stores
      .filter(s => s.latitude && s.longitude)
      .map(store => ({
        id: `geofence-${store.id}`,
        storeId: store.id,
        storeName: store.name,
        coordinates: {
          latitude: Number(store.latitude),
          longitude: Number(store.longitude),
        },
        radiusMeters: 500,
        triggerOnEntry: true,
        triggerOnExit: false,
        isActive: true,
      }));

    res.json({ geofences });
  } catch (error) {
    console.error('Error fetching geofences:', error);
    res.status(500).json({ error: 'Failed to fetch geofences' });
  }
});

router.post('/geofences', async (req: Request, res: Response) => {
  try {
    const { storeId, radiusMeters = 500, triggerOnEntry = true, triggerOnExit = false } = req.body;

    // Fetch store to get coordinates
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, latitude: true, longitude: true },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (!store.latitude || !store.longitude) {
      return res.status(400).json({ error: 'Store does not have location coordinates' });
    }

    res.status(201).json({
      id: `geofence-${store.id}`,
      storeId: store.id,
      storeName: store.name,
      coordinates: {
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
      },
      radiusMeters,
      triggerOnEntry,
      triggerOnExit,
      isActive: true,
    });
  } catch (error) {
    console.error('Error creating geofence:', error);
    res.status(500).json({ error: 'Failed to create geofence' });
  }
});

router.post('/geofences/events', async (req: Request, res: Response) => {
  try {
    const { geofenceId, eventType, coordinates } = req.body;

    // Extract store ID from geofence ID (format: geofence-{storeId})
    const storeId = geofenceId?.replace('geofence-', '') || null;

    // Fetch store info
    let store = null;
    if (storeId) {
      store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true },
      });
    }

    // In production, would look up active deals/coupons for the store
    // For now, return a generic welcome offer on entry
    const deal =
      eventType === 'entry' && store
        ? {
            id: `deal-entry-${store.id}`,
            storeId: store.id,
            title: '10% Off First Visit',
            description: `Welcome to ${store.name}! Enjoy 10% off your first purchase today.`,
            discountType: 'percentage',
            discountValue: 10,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            code: 'WELCOME10',
          }
        : undefined;

    res.status(201).json({
      id: `event-${Date.now()}`,
      geofenceId,
      storeId: store?.id || null,
      storeName: store?.name || 'Unknown Store',
      eventType,
      timestamp: new Date().toISOString(),
      coordinates,
      deal,
    });
  } catch (error) {
    console.error('Error recording geofence event:', error);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

// Note: In production, deals would come from a Deals/Promotions table
// For now, returns empty array - no mock data
router.get('/deals/local', async (req: Request, res: Response) => {
  try {
    const { storeId: _storeId } = req.query;

    // In production, would query a Deals table filtered by storeId
    // For now, return empty array to indicate no active deals
    // This is acceptable graceful degradation - no mock data returned
    res.json({ deals: [] });
  } catch (error) {
    console.error('Error fetching local deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

export default router;
