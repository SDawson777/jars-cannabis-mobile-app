// backend/src/routes/hardware.ts
// Hardware integration routes (smart scales, trackers, digital wallets)

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Device Management Routes
// ============================================

router.get('/hardware/devices', async (req: Request, res: Response) => {
  try {
    res.json({
      devices: [
        {
          id: 'device-1',
          type: 'smart_scale',
          name: 'Kitchen Scale',
          manufacturer: 'Pax',
          model: 'Era Pro',
          firmwareVersion: '2.1.0',
          batteryLevel: 85,
          connectionStatus: 'connected',
          lastConnected: new Date().toISOString(),
          lastSynced: new Date().toISOString(),
          capabilities: ['weight', 'tare', 'unit_conversion'],
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.get('/hardware/discover', async (req: Request, res: Response) => {
  try {
    const { types: _types } = req.query;

    res.json({
      devices: [
        {
          id: 'discovered-1',
          type: 'smart_scale',
          name: 'Scale Pro',
          manufacturer: 'Storz & Bickel',
          model: 'Crafty+',
          connectionStatus: 'disconnected',
          capabilities: ['weight', 'tare'],
        },
        {
          id: 'discovered-2',
          type: 'vaporizer',
          name: 'Mighty+',
          manufacturer: 'Storz & Bickel',
          model: 'Mighty+',
          connectionStatus: 'disconnected',
          capabilities: ['temperature', 'session_tracking', 'puff_counter'],
        },
      ],
    });
  } catch (error) {
    console.error('Error discovering devices:', error);
    res.status(500).json({ error: 'Failed to discover devices' });
  }
});

router.post('/hardware/devices/pair', async (req: Request, res: Response) => {
  try {
    const { deviceId, name } = req.body;

    res.status(201).json({
      id: deviceId,
      type: 'smart_scale',
      name: name || 'My Scale',
      manufacturer: 'Generic',
      model: 'Scale 1.0',
      connectionStatus: 'connected',
      lastConnected: new Date().toISOString(),
      capabilities: ['weight', 'tare'],
    });
  } catch (error) {
    console.error('Error pairing device:', error);
    res.status(500).json({ error: 'Failed to pair device' });
  }
});

router.delete('/hardware/devices/:deviceId', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error unpairing device:', error);
    res.status(500).json({ error: 'Failed to unpair device' });
  }
});

router.post('/hardware/devices/:deviceId/connect', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error connecting device:', error);
    res.status(500).json({ error: 'Failed to connect device' });
  }
});

router.post('/hardware/devices/:deviceId/disconnect', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error disconnecting device:', error);
    res.status(500).json({ error: 'Failed to disconnect device' });
  }
});

// ============================================
// Smart Scale Routes
// ============================================

router.get('/hardware/scales/:deviceId/readings', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    res.json({
      readings: [
        {
          id: 'reading-1',
          deviceId,
          weight: 3.5,
          unit: 'g',
          timestamp: new Date().toISOString(),
          productId: 'prod-1',
          strainName: 'Blue Dream',
        },
        {
          id: 'reading-2',
          deviceId,
          weight: 1.0,
          unit: 'g',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          strainName: 'OG Kush',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching scale readings:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

router.post('/hardware/scales/:deviceId/sync-to-journal', async (req: Request, res: Response) => {
  try {
    const { deviceId: _deviceId } = req.params;

    res.json({
      success: true,
      readings: [],
      syncedAt: new Date().toISOString(),
      newReadingsCount: 2,
    });
  } catch (error) {
    console.error('Error syncing to journal:', error);
    res.status(500).json({ error: 'Failed to sync' });
  }
});

router.post('/hardware/scales/:deviceId/tare', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error taring scale:', error);
    res.status(500).json({ error: 'Failed to tare' });
  }
});

// ============================================
// Consumption Tracker Routes
// ============================================

router.get('/hardware/trackers/:deviceId/readings', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    res.json({
      readings: [
        {
          id: 'session-1',
          deviceId,
          sessionStart: new Date(Date.now() - 3600000).toISOString(),
          sessionEnd: new Date(Date.now() - 2700000).toISOString(),
          duration: 900,
          puffs: 12,
          temperature: 185,
          temperatureUnit: 'C',
          totalDosage: 0.15,
          dosageUnit: 'g',
          strain: 'Blue Dream',
          effects: ['relaxed', 'happy'],
          mood: 8,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching tracker readings:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

router.post('/hardware/trackers/:deviceId/sync-to-journal', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      readings: [],
      syncedAt: new Date().toISOString(),
      newReadingsCount: 1,
    });
  } catch (error) {
    console.error('Error syncing tracker to journal:', error);
    res.status(500).json({ error: 'Failed to sync' });
  }
});

router.post('/hardware/trackers/:deviceId/sessions/start', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { productId, strain } = req.body;

    res.status(201).json({
      id: `session-${Date.now()}`,
      deviceId,
      sessionStart: new Date().toISOString(),
      productId,
      strain,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post(
  '/hardware/trackers/:deviceId/sessions/:sessionId/end',
  async (req: Request, res: Response) => {
    try {
      const { deviceId, sessionId } = req.params;
      const { effects, mood, notes } = req.body;

      res.json({
        id: sessionId,
        deviceId,
        sessionStart: new Date(Date.now() - 900000).toISOString(),
        sessionEnd: new Date().toISOString(),
        duration: 900,
        puffs: 8,
        effects,
        mood,
        notes,
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  }
);

router.post('/hardware/sync', async (req: Request, res: Response) => {
  try {
    const { deviceId: _deviceId } = req.body;

    res.json({
      success: true,
      readings: [],
      syncedAt: new Date().toISOString(),
      newReadingsCount: 0,
    });
  } catch (error) {
    console.error('Error syncing device:', error);
    res.status(500).json({ error: 'Failed to sync' });
  }
});

// ============================================
// Digital Wallet Routes
// ============================================

router.get('/wallet/passes', async (req: Request, res: Response) => {
  try {
    res.json({
      passes: [
        {
          id: 'pass-1',
          type: 'loyalty_card',
          provider: 'apple_wallet',
          name: 'Nimbus Rewards',
          barcode: {
            type: 'qr',
            value: 'NIMBUS-MEM-123456',
          },
          points: 1500,
          tier: 'Gold',
          isInstalled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching passes:', error);
    res.status(500).json({ error: 'Failed to fetch passes' });
  }
});

router.get('/wallet/loyalty-card', async (req: Request, res: Response) => {
  try {
    res.json({
      id: 'loyalty-1',
      type: 'loyalty_card',
      provider: 'apple_wallet',
      name: 'Nimbus Rewards',
      memberId: 'MEM-123456',
      points: 1500,
      tier: 'Gold',
      tierProgress: 75,
      nextTierPoints: 500,
      barcode: {
        type: 'qr',
        value: 'NIMBUS-MEM-123456',
      },
      rewards: [
        { id: 'reward-1', name: '$5 Off', pointsCost: 500 },
        { id: 'reward-2', name: 'Free Pre-Roll', pointsCost: 1000 },
      ],
      isInstalled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching loyalty card:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty card' });
  }
});

router.post('/wallet/passes/add-to-wallet', async (req: Request, res: Response) => {
  try {
    const { passId, provider } = req.body;

    res.json({
      passUrl: `https://nimbus.app/wallet/pass/${passId}?provider=${provider}`,
      success: true,
    });
  } catch (error) {
    console.error('Error adding to wallet:', error);
    res.status(500).json({ error: 'Failed to add to wallet' });
  }
});

router.post('/wallet/loyalty-card/generate', async (req: Request, res: Response) => {
  try {
    const { provider, storeId } = req.body;

    res.status(201).json({
      id: `loyalty-${Date.now()}`,
      type: 'loyalty_card',
      provider,
      name: 'Nimbus Rewards',
      storeId,
      storeName: 'Nimbus Cannabis',
      memberId: `MEM-${Date.now()}`,
      points: 0,
      tier: 'Bronze',
      tierProgress: 0,
      nextTierPoints: 500,
      barcode: {
        type: 'qr',
        value: `NIMBUS-MEM-${Date.now()}`,
      },
      passUrl: `https://nimbus.app/wallet/loyalty?provider=${provider}`,
      isInstalled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating loyalty pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
});

export default router;
