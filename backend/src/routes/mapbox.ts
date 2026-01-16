// backend/src/routes/mapbox.ts
// Map, geolocation, and geofencing routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Store Locator Routes
// ============================================

router.get('/stores/nearby', async (req: Request, res: Response) => {
  try {
    const { lat: _lat, lng: _lng, radius: _radius = 25, services: _services, limit: _limit = 20 } = req.query;
    
    // Mock nearby stores with distance/traffic info
    res.json({
      stores: [
        {
          id: 'store-1',
          name: 'Nimbus Downtown',
          address: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(555) 123-4567',
          coordinates: { latitude: 34.0522, longitude: -118.2437 },
          hours: {
            monday: { open: '09:00', close: '21:00', isClosed: false },
            tuesday: { open: '09:00', close: '21:00', isClosed: false },
            wednesday: { open: '09:00', close: '21:00', isClosed: false },
            thursday: { open: '09:00', close: '21:00', isClosed: false },
            friday: { open: '09:00', close: '22:00', isClosed: false },
            saturday: { open: '10:00', close: '22:00', isClosed: false },
            sunday: { open: '10:00', close: '20:00', isClosed: false },
          },
          isOpen: true,
          distance: 2.3,
          duration: 8,
          trafficLevel: 'moderate',
          amenities: ['Parking', 'Wheelchair Accessible', 'ATM'],
          services: ['pickup', 'delivery', 'inStore'],
          rating: 4.7,
          reviewCount: 328,
          image: 'https://example.com/store1.jpg',
        },
        {
          id: 'store-2',
          name: 'Nimbus Westside',
          address: '456 Ocean Ave',
          city: 'Santa Monica',
          state: 'CA',
          zip: '90401',
          phone: '(555) 987-6543',
          coordinates: { latitude: 34.0195, longitude: -118.4912 },
          hours: {
            monday: { open: '10:00', close: '20:00', isClosed: false },
            tuesday: { open: '10:00', close: '20:00', isClosed: false },
            wednesday: { open: '10:00', close: '20:00', isClosed: false },
            thursday: { open: '10:00', close: '20:00', isClosed: false },
            friday: { open: '10:00', close: '21:00', isClosed: false },
            saturday: { open: '10:00', close: '21:00', isClosed: false },
            sunday: { open: '11:00', close: '19:00', isClosed: false },
          },
          isOpen: true,
          distance: 5.8,
          duration: 18,
          trafficLevel: 'heavy',
          amenities: ['Parking', 'Lounge'],
          services: ['pickup', 'inStore'],
          rating: 4.5,
          reviewCount: 215,
          image: 'https://example.com/store2.jpg',
        },
      ],
    });
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
    const { q: _q } = req.query;
    
    res.json({
      results: [
        {
          id: 'result-1',
          name: 'Nimbus Downtown',
          address: '123 Main St, Los Angeles, CA',
          coordinates: { latitude: 34.0522, longitude: -118.2437 },
          type: 'store',
          distance: 2.3,
        },
      ],
    });
  } catch (error) {
    console.error('Error searching map:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================
// Directions Routes
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

router.get('/map/travel-times', async (req: Request, res: Response) => {
  try {
    const { storeIds } = req.query;
    const ids = (storeIds as string)?.split(',') || [];
    
    const times: Record<string, { distance: number; duration: number; trafficLevel: string }> = {};
    ids.forEach((id: string, index: number) => {
      times[id] = {
        distance: 3000 + index * 2000,
        duration: 480 + index * 300,
        trafficLevel: index % 2 === 0 ? 'moderate' : 'low',
      };
    });
    
    res.json(times);
  } catch (error) {
    console.error('Error fetching travel times:', error);
    res.status(500).json({ error: 'Failed to get travel times' });
  }
});

// ============================================
// Geofencing Routes
// ============================================

router.get('/geofences', async (req: Request, res: Response) => {
  try {
    res.json({
      geofences: [
        {
          id: 'geofence-1',
          storeId: 'store-1',
          storeName: 'Nimbus Downtown',
          coordinates: { latitude: 34.0522, longitude: -118.2437 },
          radiusMeters: 500,
          triggerOnEntry: true,
          triggerOnExit: false,
          isActive: true,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching geofences:', error);
    res.status(500).json({ error: 'Failed to fetch geofences' });
  }
});

router.post('/geofences', async (req: Request, res: Response) => {
  try {
    const { storeId, radiusMeters = 500, triggerOnEntry = true, triggerOnExit = false } = req.body;
    
    res.status(201).json({
      id: `geofence-${Date.now()}`,
      storeId,
      storeName: 'Nimbus Downtown',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
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
    
    // Could trigger local deals notification here
    const deal = eventType === 'entry' ? {
      id: 'deal-1',
      storeId: 'store-1',
      title: '10% Off First Visit',
      description: 'Welcome! Enjoy 10% off your first purchase today.',
      discountType: 'percentage',
      discountValue: 10,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      code: 'WELCOME10',
    } : undefined;
    
    res.status(201).json({
      id: `event-${Date.now()}`,
      geofenceId,
      storeId: 'store-1',
      storeName: 'Nimbus Downtown',
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

router.get('/deals/local', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    
    res.json({
      deals: [
        {
          id: 'deal-1',
          storeId: storeId || 'store-1',
          title: 'Happy Hour Special',
          description: '20% off all edibles from 4-6 PM',
          discountType: 'percentage',
          discountValue: 20,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          image: 'https://example.com/deal.jpg',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching local deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

export default router;
