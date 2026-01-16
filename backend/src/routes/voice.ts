// backend/src/routes/voice.ts
// Voice & chat assistant routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Voice Command Processing
// ============================================

router.post('/process', async (req: Request, res: Response) => {
  try {
    const { transcript, context: _context } = req.body;

    // Simple intent detection (in production, use NLP service)
    let intent = 'unknown';
    let entities: Record<string, unknown> = {};

    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('search') || lowerTranscript.includes('find')) {
      intent = 'search_products';
      const match = lowerTranscript.match(/(?:search|find)\s+(?:for\s+)?(.+)/);
      if (match) entities.query = match[1];
    } else if (lowerTranscript.includes('add') && lowerTranscript.includes('cart')) {
      intent = 'add_to_cart';
    } else if (lowerTranscript.includes('cart') || lowerTranscript.includes('basket')) {
      intent = 'view_cart';
    } else if (lowerTranscript.includes('checkout') || lowerTranscript.includes('pay')) {
      intent = 'checkout';
    } else if (lowerTranscript.includes('reorder') || lowerTranscript.includes('order again')) {
      intent = 'reorder';
    } else if (lowerTranscript.includes('track') || lowerTranscript.includes('where is my order')) {
      intent = 'track_order';
    } else if (lowerTranscript.includes('hours') || lowerTranscript.includes('open')) {
      intent = 'store_hours';
    } else if (lowerTranscript.includes('recommend') || lowerTranscript.includes('suggest')) {
      intent = 'recommendation';
    } else if (lowerTranscript.includes('help')) {
      intent = 'help';
    }

    res.json({
      id: `cmd-${Date.now()}`,
      transcript,
      intent,
      entities,
      confidence: 0.85,
      response: {
        text: getResponseForIntent(intent),
        displayData: intent === 'search_products' ? { type: 'products', data: [] } : undefined,
        actions: getActionsForIntent(intent),
        followUp: intent === 'unknown' ? 'Would you like me to search for products?' : undefined,
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

router.get('/history', async (req: Request, res: Response) => {
  try {
    res.json({ commands: [] });
  } catch (error) {
    console.error('Error fetching command history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ============================================
// Voice Settings
// ============================================

router.get('/settings', async (req: Request, res: Response) => {
  try {
    res.json({
      enabled: true,
      wakeWord: 'hey_nimbus',
      language: 'en-US',
      voiceId: 'default',
      speakResponses: true,
      confirmOrders: true,
      shortcuts: [],
    });
  } catch (error) {
    console.error('Error fetching voice settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    res.json({ ...settings });
  } catch (error) {
    console.error('Error updating voice settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// Siri Shortcuts (iOS)
// ============================================

router.get('/siri/shortcuts', async (req: Request, res: Response) => {
  try {
    res.json({
      shortcuts: [
        {
          id: 'shortcut-1',
          title: 'Reorder my last order',
          phrase: 'Reorder from Nimbus',
          activityType: 'com.nimbus.reorder',
          isActive: true,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching Siri shortcuts:', error);
    res.status(500).json({ error: 'Failed to fetch shortcuts' });
  }
});

router.post('/siri/shortcuts', async (req: Request, res: Response) => {
  try {
    const shortcut = req.body;
    res.status(201).json({
      id: `shortcut-${Date.now()}`,
      ...shortcut,
      isActive: true,
    });
  } catch (error) {
    console.error('Error creating Siri shortcut:', error);
    res.status(500).json({ error: 'Failed to create shortcut' });
  }
});

router.post('/siri/suggest', async (req: Request, res: Response) => {
  try {
    res.json({ suggested: true });
  } catch (error) {
    console.error('Error suggesting Siri shortcut:', error);
    res.status(500).json({ error: 'Failed to suggest shortcut' });
  }
});

// ============================================
// Google Assistant (Android)
// ============================================

router.get('/google/actions', async (req: Request, res: Response) => {
  try {
    res.json({
      actions: [
        {
          id: 'action-1',
          name: 'Reorder',
          actionId: 'com.nimbus.actions.REORDER',
          parameters: {},
          isEnabled: true,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching Google actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

router.post('/google/actions', async (req: Request, res: Response) => {
  try {
    const action = req.body;
    res.status(201).json({
      id: `action-${Date.now()}`,
      ...action,
      isEnabled: true,
    });
  } catch (error) {
    console.error('Error registering Google action:', error);
    res.status(500).json({ error: 'Failed to register action' });
  }
});

// ============================================
// Helper Functions
// ============================================

function getResponseForIntent(intent: string): string {
  const responses: Record<string, string> = {
    search_products: 'I found some products for you.',
    add_to_cart: "I've added that to your cart.",
    view_cart: "Here's what's in your cart.",
    checkout: 'Let me start the checkout process for you.',
    reorder: 'I can help you reorder your last purchase.',
    track_order: 'Let me check on your order status.',
    store_hours: 'Our store is open from 9 AM to 9 PM today.',
    recommendation: "Based on your preferences, I'd recommend trying...",
    help: 'I can help you search products, manage your cart, track orders, or get recommendations.',
    unknown: "I'm not sure I understood that. Could you try again?",
  };
  return responses[intent] || responses.unknown;
}

function getActionsForIntent(
  intent: string
): Array<{ type: string; label: string; payload: Record<string, unknown> }> {
  const actions: Record<
    string,
    Array<{ type: string; label: string; payload: Record<string, unknown> }>
  > = {
    view_cart: [{ type: 'navigate', label: 'View Cart', payload: { screen: 'Cart' } }],
    checkout: [{ type: 'navigate', label: 'Checkout', payload: { screen: 'Checkout' } }],
    reorder: [{ type: 'add_to_cart', label: 'Reorder', payload: { fromLastOrder: true } }],
    track_order: [{ type: 'navigate', label: 'Track Order', payload: { screen: 'OrderTracking' } }],
  };
  return actions[intent] || [];
}

export default router;
