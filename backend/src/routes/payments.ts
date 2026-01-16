// backend/src/routes/payments.ts
// Cannabis-compliant payment processor routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Payment Processors
// ============================================

router.get('/payments/processors', async (req: Request, res: Response) => {
  try {
    res.json({
      processors: [
        {
          processor: 'hypur',
          name: 'Hypur',
          displayName: 'Hypur Pay',
          isEnabled: true,
          isConfigured: false, // Wired for future use
          supportedMethods: ['bank_account', 'debit_card'],
          fees: { percentage: 2.5, flatFee: 0.3 },
          features: {
            supportsRefunds: true,
            supportsPartialRefunds: true,
            supportsRecurring: false,
            supportsTips: true,
          },
          logoUrl: 'https://example.com/hypur-logo.png',
          setupUrl: 'https://hypur.com/merchant-signup',
        },
        {
          processor: 'dutchie_pay',
          name: 'Dutchie Pay',
          displayName: 'Dutchie Pay',
          isEnabled: true,
          isConfigured: false,
          supportedMethods: ['bank_account', 'ach'],
          fees: { percentage: 1.75, flatFee: 0.25 },
          features: {
            supportsRefunds: true,
            supportsPartialRefunds: true,
            supportsRecurring: false,
            supportsTips: true,
          },
          logoUrl: 'https://example.com/dutchie-logo.png',
          setupUrl: 'https://dutchie.com/pay',
        },
        {
          processor: 'aeropay',
          name: 'AeroPay',
          displayName: 'AeroPay',
          isEnabled: true,
          isConfigured: false,
          supportedMethods: ['bank_account'],
          fees: { percentage: 1.5, flatFee: 0.2 },
          features: {
            supportsRefunds: true,
            supportsPartialRefunds: false,
            supportsRecurring: true,
            supportsTips: true,
          },
          logoUrl: 'https://example.com/aeropay-logo.png',
        },
        {
          processor: 'canpay',
          name: 'CanPay',
          displayName: 'CanPay Debit',
          isEnabled: true,
          isConfigured: false,
          supportedMethods: ['debit_card', 'bank_account'],
          fees: { percentage: 2.0, flatFee: 0.25 },
          features: {
            supportsRefunds: true,
            supportsPartialRefunds: true,
            supportsRecurring: false,
            supportsTips: true,
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching processors:', error);
    res.status(500).json({ error: 'Failed to fetch processors' });
  }
});

router.get('/payments/processors/:processor', async (req: Request, res: Response) => {
  try {
    const { processor } = req.params;
    res.json({
      processor,
      name: processor.charAt(0).toUpperCase() + processor.slice(1),
      displayName: processor,
      isEnabled: true,
      isConfigured: false,
      supportedMethods: ['bank_account', 'debit_card'],
      fees: { percentage: 2.0, flatFee: 0.25 },
      features: {
        supportsRefunds: true,
        supportsPartialRefunds: true,
        supportsRecurring: false,
        supportsTips: true,
      },
    });
  } catch (error) {
    console.error('Error fetching processor:', error);
    res.status(500).json({ error: 'Failed to fetch processor' });
  }
});

// ============================================
// Payment Methods
// ============================================

router.get('/payments/methods', async (req: Request, res: Response) => {
  try {
    res.json({
      methods: [
        {
          id: 'pm-1',
          processor: 'hypur',
          type: 'bank_account',
          last4: '4567',
          bankName: 'Chase Bank',
          isDefault: true,
          isVerified: true,
          nickname: 'Checking',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch methods' });
  }
});

router.post('/payments/methods', async (req: Request, res: Response) => {
  try {
    const method = req.body;
    res.status(201).json({
      id: `pm-${Date.now()}`,
      ...method,
      isDefault: method.setAsDefault || false,
      isVerified: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add method' });
  }
});

router.delete('/payments/methods/:methodId', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Failed to remove method' });
  }
});

router.post('/payments/methods/default', async (req: Request, res: Response) => {
  try {
    const { methodId } = req.body;
    res.json({
      id: methodId,
      isDefault: true,
    });
  } catch (error) {
    console.error('Error setting default method:', error);
    res.status(500).json({ error: 'Failed to set default' });
  }
});

// ============================================
// Payment Intents
// ============================================

router.post('/payments/intents', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'USD', orderId, paymentMethodId, processor, metadata } = req.body;

    res.status(201).json({
      id: `pi-${Date.now()}`,
      processor: processor || 'hypur',
      amount,
      currency,
      status: 'pending',
      orderId,
      paymentMethodId,
      clientSecret: `secret_${Date.now()}`,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.get('/payments/intents/:intentId', async (req: Request, res: Response) => {
  try {
    const { intentId } = req.params;
    res.json({
      id: intentId,
      processor: 'hypur',
      amount: 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    res.status(500).json({ error: 'Failed to fetch intent' });
  }
});

router.post('/payments/intents/:intentId/confirm', async (req: Request, res: Response) => {
  try {
    const { intentId } = req.params;

    res.json({
      success: true,
      paymentIntentId: intentId,
      transactionId: `txn-${Date.now()}`,
      status: 'succeeded',
      receipt: {
        url: `https://receipts.example.com/${intentId}`,
        number: `RCP-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

router.post('/payments/intents/:intentId/cancel', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
});

// ============================================
// Refunds
// ============================================

router.post('/payments/refunds', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount: _amount, reason: _reason } = req.body;

    res.status(201).json({
      success: true,
      paymentIntentId,
      transactionId: `ref-${Date.now()}`,
      status: 'succeeded',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// ============================================
// POS Routes
// ============================================

router.get('/pos/terminals', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;

    res.json({
      terminals: [
        {
          id: 'term-1',
          name: 'Register 1',
          storeId: storeId || 'store-1',
          type: 'integrated',
          status: 'online',
          lastSeen: new Date().toISOString(),
          capabilities: ['chip', 'swipe', 'contactless', 'manual'],
        },
        {
          id: 'term-2',
          name: 'Register 2',
          storeId: storeId || 'store-1',
          type: 'standalone',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
          capabilities: ['chip', 'swipe'],
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching terminals:', error);
    res.status(500).json({ error: 'Failed to fetch terminals' });
  }
});

router.post('/pos/transactions', async (req: Request, res: Response) => {
  try {
    const { terminalId, amount, tip, orderId, paymentMethod } = req.body;

    res.status(201).json({
      id: `pos-${Date.now()}`,
      type: 'sale',
      amount,
      tip,
      tax: Math.round(amount * 0.0975), // 9.75% tax
      status: 'pending',
      paymentMethod,
      terminalId,
      orderId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error initiating POS transaction:', error);
    res.status(500).json({ error: 'Failed to initiate transaction' });
  }
});

router.get('/pos/transactions/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    res.json({
      id: transactionId,
      type: 'sale',
      amount: 5000,
      tip: 500,
      tax: 488,
      status: 'completed',
      paymentMethod: 'debit_card',
      terminalId: 'term-1',
      receiptNumber: `RCP-${transactionId}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching POS transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

export default router;
