// backend/src/routes/events.ts
// Store events routes

import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      events: [
        {
          id: 'event-1',
          storeId: 'store-1',
          storeName: 'Nimbus Downtown',
          title: 'Terpene Tasting Workshop',
          description: 'Learn about terpenes and taste different strains',
          image: 'https://example.com/workshop.jpg',
          type: 'workshop',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ).toISOString(),
          timezone: 'America/Los_Angeles',
          isVirtual: false,
          location: '123 Main St, Los Angeles, CA',
          capacity: 20,
          registeredCount: 12,
          isRegistered: false,
          price: 25,
          isFree: false,
          requirements: ['21+ only', 'Valid ID required'],
          tags: ['terpenes', 'education', 'tasting'],
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/registered', async (req: Request, res: Response) => {
  try {
    res.json({ events: [] });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    res.json({
      id: eventId,
      storeId: 'store-1',
      storeName: 'Nimbus Downtown',
      title: 'Terpene Tasting Workshop',
      description: 'Learn about terpenes',
      type: 'workshop',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      timezone: 'America/Los_Angeles',
      isVirtual: false,
      capacity: 20,
      registeredCount: 12,
      isRegistered: false,
      isFree: false,
      tags: [],
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/:eventId/register', async (req: Request, res: Response) => {
  try {
    res.status(201).json({ registrationId: `reg-${Date.now()}` });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.delete('/:eventId/register', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

export default router;
