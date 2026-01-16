// backend/src/routes/appointments.ts
// Appointment and event booking routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Appointment Routes
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      appointments: [
        {
          id: 'apt-1',
          userId: 'user-123',
          type: 'consultation',
          status: 'confirmed',
          title: 'Product Consultation',
          description: 'Discuss product recommendations',
          storeId: 'store-1',
          storeName: 'Nimbus Downtown',
          storeAddress: '123 Main St, Los Angeles, CA',
          budtenderId: 'bud-1',
          budtenderName: 'Alex',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          duration: 30,
          timezone: 'America/Los_Angeles',
          isVirtual: false,
          reminderSent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    res.json({
      appointments: [],
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:appointmentId', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    res.json({
      id: appointmentId,
      userId: 'user-123',
      type: 'consultation',
      status: 'confirmed',
      title: 'Product Consultation',
      storeId: 'store-1',
      storeName: 'Nimbus Downtown',
      storeAddress: '123 Main St',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      duration: 30,
      timezone: 'America/Los_Angeles',
      isVirtual: false,
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.get('/slots', async (req: Request, res: Response) => {
  try {
    const { storeId: _storeId, date, appointmentType: _appointmentType, budtenderId } = req.query;

    // Generate available time slots
    const slots = [];
    const baseDate = new Date(date as string);
    for (let hour = 10; hour < 18; hour++) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(30);

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: Math.random() > 0.3,
        budtenderId: budtenderId as string,
        budtenderName: 'Alex',
      });
    }

    res.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const booking = req.body;
    res.status(201).json({
      id: `apt-${Date.now()}`,
      userId: 'user-123',
      ...booking,
      status: 'pending',
      duration: 30,
      timezone: 'America/Los_Angeles',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

router.patch('/:appointmentId/reschedule', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { newStartTime, reason: _reason } = req.body;
    res.json({
      id: appointmentId,
      startTime: newStartTime,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

router.post('/:appointmentId/cancel', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

router.post('/:appointmentId/confirm', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    res.json({
      id: appointmentId,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Failed to confirm appointment' });
  }
});

router.post('/:appointmentId/reminders', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error setting reminder:', error);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

// ============================================
// Budtender Routes
// ============================================

router.get('/budtenders/:budtenderId/availability', async (req: Request, res: Response) => {
  try {
    const { date: _date } = req.query;
    res.json({ slots: [] });
  } catch (error) {
    console.error('Error fetching budtender availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// ============================================
// Store Budtenders (separate path)
// ============================================

export const storesBudtendersHandler = async (req: Request, res: Response) => {
  try {
    res.json({
      budtenders: [
        {
          id: 'bud-1',
          name: 'Alex',
          avatar: 'https://example.com/alex.jpg',
          bio: 'Cannabis expert with 5 years experience',
          specialties: ['edibles', 'tinctures', 'medical'],
          languages: ['English', 'Spanish'],
          rating: 4.9,
          reviewCount: 150,
          isAvailable: true,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching budtenders:', error);
    res.status(500).json({ error: 'Failed to fetch budtenders' });
  }
};

export default router;
