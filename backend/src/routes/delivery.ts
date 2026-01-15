// backend/src/routes/delivery.ts
// Delivery scheduling, tracking and pickup window management

import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';

export const deliveryRouter = Router();

/**
 * GET /delivery/windows
 * Get available delivery windows for an address
 */
deliveryRouter.get('/delivery/windows', requireAuth, async (req: Request, res: Response) => {
  const { addressId, date } = req.query;
  
  if (!addressId) {
    return res.status(400).json({ error: 'addressId is required' });
  }
  
  try {
    // Generate delivery windows for next 7 days
    const windows = [];
    const baseDate = date ? new Date(date as string) : new Date();
    
    for (let day = 0; day < 7; day++) {
      const windowDate = new Date(baseDate);
      windowDate.setDate(windowDate.getDate() + day);
      const dateStr = windowDate.toISOString().split('T')[0];
      
      // Morning window
      windows.push({
        id: `${dateStr}-morning`,
        date: dateStr,
        startTime: '09:00',
        endTime: '12:00',
        available: Math.random() > 0.2,
        price: 4.99,
        type: 'standard',
        estimatedMinutes: 45,
      });
      
      // Afternoon window
      windows.push({
        id: `${dateStr}-afternoon`,
        date: dateStr,
        startTime: '12:00',
        endTime: '17:00',
        available: Math.random() > 0.3,
        price: 4.99,
        type: 'standard',
        estimatedMinutes: 45,
      });
      
      // Evening window
      windows.push({
        id: `${dateStr}-evening`,
        date: dateStr,
        startTime: '17:00',
        endTime: '21:00',
        available: Math.random() > 0.4,
        price: 6.99,
        type: 'standard',
        estimatedMinutes: 45,
      });
      
      // Express window (today only)
      if (day === 0) {
        windows.unshift({
          id: `${dateStr}-express`,
          date: dateStr,
          startTime: 'ASAP',
          endTime: '1 hour',
          available: true,
          price: 9.99,
          type: 'express',
          estimatedMinutes: 30,
        });
      }
    }
    
    res.json({ windows });
  } catch (error) {
    console.error('Delivery windows error:', error);
    res.status(500).json({ error: 'Failed to get delivery windows' });
  }
});

/**
 * GET /stores/:storeId/pickup-windows
 * Get available pickup windows for a store
 */
deliveryRouter.get('/stores/:storeId/pickup-windows', optionalAuth, async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { date } = req.query;
  
  try {
    // Generate pickup windows
    const windows = [];
    const baseDate = date ? new Date(date as string) : new Date();
    
    for (let day = 0; day < 7; day++) {
      const windowDate = new Date(baseDate);
      windowDate.setDate(windowDate.getDate() + day);
      const dateStr = windowDate.toISOString().split('T')[0];
      
      // Generate 30-minute slots from 10am to 8pm
      for (let hour = 10; hour < 20; hour++) {
        windows.push({
          id: `${dateStr}-${hour}00`,
          storeId,
          date: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${hour.toString().padStart(2, '0')}:30`,
          available: Math.random() > 0.2,
          spotsRemaining: Math.floor(Math.random() * 5) + 1,
        });
        
        windows.push({
          id: `${dateStr}-${hour}30`,
          storeId,
          date: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:30`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          available: Math.random() > 0.2,
          spotsRemaining: Math.floor(Math.random() * 5) + 1,
        });
      }
    }
    
    res.json({ windows });
  } catch (error) {
    console.error('Pickup windows error:', error);
    res.status(500).json({ error: 'Failed to get pickup windows' });
  }
});

/**
 * GET /delivery/estimate
 * Get delivery estimate for an address
 */
deliveryRouter.get('/delivery/estimate', requireAuth, async (req: Request, res: Response) => {
  const { addressId, cartTotal } = req.query;
  
  if (!addressId) {
    return res.status(400).json({ error: 'addressId is required' });
  }
  
  try {
    const total = cartTotal ? parseFloat(cartTotal as string) : 0;
    const freeDeliveryThreshold = 50;
    
    res.json({
      addressId,
      estimatedMinutes: 35,
      estimatedArrival: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      fee: total >= freeDeliveryThreshold ? 0 : 4.99,
      freeDeliveryThreshold,
      amountToFreeDelivery: total < freeDeliveryThreshold ? freeDeliveryThreshold - total : 0,
    });
  } catch (error) {
    console.error('Delivery estimate error:', error);
    res.status(500).json({ error: 'Failed to get delivery estimate' });
  }
});

/**
 * POST /delivery/schedule
 * Schedule delivery for an order
 */
deliveryRouter.post('/delivery/schedule', requireAuth, async (req: Request, res: Response) => {
  const { orderId, windowId } = req.body;
  
  if (!orderId || !windowId) {
    return res.status(400).json({ error: 'orderId and windowId are required' });
  }
  
  try {
    // Parse window ID to get date and time
    const [date, timeSlot] = windowId.split('-');
    
    res.json({
      orderId,
      windowId,
      date,
      startTime: timeSlot === 'express' ? 'ASAP' : timeSlot.replace(/(\d{2})(\d{2})/, '$1:$2'),
      endTime: timeSlot === 'express' ? '1 hour' : undefined,
      type: 'delivery',
    });
  } catch (error) {
    console.error('Schedule delivery error:', error);
    res.status(500).json({ error: 'Failed to schedule delivery' });
  }
});

/**
 * POST /pickup/schedule
 * Schedule pickup for an order
 */
deliveryRouter.post('/pickup/schedule', requireAuth, async (req: Request, res: Response) => {
  const { orderId, storeId, windowId } = req.body;
  
  if (!orderId || !storeId || !windowId) {
    return res.status(400).json({ error: 'orderId, storeId, and windowId are required' });
  }
  
  try {
    res.json({
      orderId,
      windowId,
      storeId,
      storeName: 'Nimbus Downtown',
      type: 'pickup',
    });
  } catch (error) {
    console.error('Schedule pickup error:', error);
    res.status(500).json({ error: 'Failed to schedule pickup' });
  }
});

/**
 * GET /orders/:orderId/tracking
 * Get order tracking information
 */
deliveryRouter.get('/orders/:orderId/tracking', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  
  try {
    // Mock tracking data
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = Math.floor(Math.random() * statuses.length);
    const currentStatus = statuses[currentStatusIndex];
    
    const statusHistory = statuses.slice(0, currentStatusIndex + 1).map((status, i) => ({
      status,
      timestamp: new Date(Date.now() - (currentStatusIndex - i) * 15 * 60 * 1000).toISOString(),
      note: status === 'confirmed' ? 'Order confirmed and payment processed' : undefined,
    }));
    
    const tracking = {
      orderId,
      orderNumber: `ORD-${orderId.slice(-6).toUpperCase()}`,
      status: currentStatus,
      statusHistory,
      estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      driver: currentStatus === 'out_for_delivery' ? {
        name: 'Alex M.',
        phone: '+1 (555) 123-4567',
        photoUrl: 'https://placehold.co/100',
        vehicleDescription: 'Blue Honda Civic',
      } : undefined,
      currentLocation: currentStatus === 'out_for_delivery' ? {
        latitude: 37.7749,
        longitude: -122.4194,
        updatedAt: new Date().toISOString(),
      } : undefined,
    };
    
    res.json(tracking);
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking' });
  }
});

/**
 * GET /orders/:orderId/driver-location
 * Get live driver location
 */
deliveryRouter.get('/orders/:orderId/driver-location', requireAuth, async (req: Request, res: Response) => {
  try {
    // Mock live location
    res.json({
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      heading: Math.floor(Math.random() * 360),
      eta: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Driver location error:', error);
    res.status(500).json({ error: 'Failed to get driver location' });
  }
});

/**
 * POST /orders/:orderId/delivery-instructions
 * Update delivery instructions
 */
deliveryRouter.post('/orders/:orderId/delivery-instructions', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { instructions } = req.body;
  
  try {
    // In production, update order in database
    res.json({ success: true });
  } catch (error) {
    console.error('Update instructions error:', error);
    res.status(500).json({ error: 'Failed to update instructions' });
  }
});

/**
 * POST /orders/:orderId/confirm-delivery
 * Confirm order receipt
 */
deliveryRouter.post('/orders/:orderId/confirm-delivery', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { signature, rating } = req.body;
  
  try {
    // In production, update order status and store rating
    res.json({ success: true });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
});

export default deliveryRouter;
