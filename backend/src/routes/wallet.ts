// backend/src/routes/wallet.ts
// In-app wallet for loyalty points, gift cards, digital receipts

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';

export const walletRouter = Router();

/**
 * GET /wallet/balance
 * Get wallet balance summary
 */
walletRouter.get('/wallet/balance', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  
  try {
    // Get loyalty points
    const loyalty = await prisma.loyaltyStatus.findUnique({
      where: { userId },
    });
    
    const loyaltyPoints = loyalty?.points || 0;
    const loyaltyValue = loyaltyPoints * 0.01; // 1 point = $0.01
    
    // Mock other balances (in production, aggregate from database)
    const giftCardBalance = 25.00;
    const storeCredit = 5.00;
    
    res.json({
      loyaltyPoints,
      loyaltyValue,
      giftCardBalance,
      storeCredit,
      cannabisTokens: 0, // For future use
      totalValue: loyaltyValue + giftCardBalance + storeCredit,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
});

/**
 * GET /wallet/gift-cards
 * Get user's gift cards
 */
walletRouter.get('/wallet/gift-cards', requireAuth, async (req: Request, res: Response) => {
  try {
    // Mock gift cards
    res.json({
      giftCards: [
        {
          id: 'gc-1',
          code: 'XXXX-XXXX-XXXX-1234',
          balance: 25.00,
          originalAmount: 50.00,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          source: 'purchased',
        },
      ],
    });
  } catch (error) {
    console.error('Gift cards error:', error);
    res.status(500).json({ error: 'Failed to get gift cards' });
  }
});

/**
 * POST /wallet/gift-cards/add
 * Add a gift card to wallet
 */
walletRouter.post('/wallet/gift-cards/add', requireAuth, async (req: Request, res: Response) => {
  const { code, pin } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Gift card code is required' });
  }
  
  try {
    // In production, validate card and add to user's wallet
    res.status(201).json({
      id: `gc-${Date.now()}`,
      code: code.slice(0, 4) + '-XXXX-XXXX-' + code.slice(-4),
      balance: 50.00,
      originalAmount: 50.00,
      purchasedAt: new Date().toISOString(),
      isActive: true,
      source: 'received',
    });
  } catch (error) {
    console.error('Add gift card error:', error);
    res.status(500).json({ error: 'Failed to add gift card' });
  }
});

/**
 * POST /wallet/gift-cards/check-balance
 * Check gift card balance without adding
 */
walletRouter.post('/wallet/gift-cards/check-balance', requireAuth, async (req: Request, res: Response) => {
  const { code, pin } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Gift card code is required' });
  }
  
  try {
    // In production, query gift card system
    res.json({
      balance: 50.00,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Check balance error:', error);
    res.status(500).json({ error: 'Failed to check balance' });
  }
});

/**
 * POST /wallet/gift-cards/purchase
 * Purchase a gift card
 */
walletRouter.post('/wallet/gift-cards/purchase', requireAuth, async (req: Request, res: Response) => {
  const { amount, recipientEmail, recipientName, message, sendDate } = req.body;
  
  if (!amount || amount < 10 || amount > 500) {
    return res.status(400).json({ error: 'Amount must be between $10 and $500' });
  }
  
  try {
    const giftCard = {
      id: `gc-${Date.now()}`,
      code: `NIMB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      balance: amount,
      originalAmount: amount,
      purchasedAt: new Date().toISOString(),
      isActive: true,
      source: recipientEmail ? 'gift' : 'purchased',
    };
    
    res.status(201).json({
      giftCard,
      orderId: `order-${Date.now()}`,
    });
  } catch (error) {
    console.error('Purchase gift card error:', error);
    res.status(500).json({ error: 'Failed to purchase gift card' });
  }
});

/**
 * GET /wallet/receipts
 * Get digital receipts
 */
walletRouter.get('/wallet/receipts', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { cursor } = req.query;
  
  try {
    // Get user's orders
    const orders = await (prisma as any).order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { items: true },
    });
    
    const receipts = orders.map((order: any) => ({
      id: `receipt-${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      storeName: 'Nimbus Cannabis',
      storeAddress: '123 Main St, San Francisco, CA',
      purchaseDate: order.createdAt,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      tip: order.tip || 0,
      total: order.total || 0,
      paymentMethod: 'Card ending in 4242',
      items: (order.items || []).map((item: any) => ({
        productId: item.productId,
        productName: item.productName || 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
      loyaltyPointsEarned: Math.floor((order.total || 0)),
    }));
    
    res.json({
      receipts,
      hasMore: false,
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Receipts error:', error);
    res.status(500).json({ error: 'Failed to get receipts' });
  }
});

/**
 * GET /wallet/receipts/:receiptId
 * Get a single receipt
 */
walletRouter.get('/wallet/receipts/:receiptId', requireAuth, async (req: Request, res: Response) => {
  const { receiptId } = req.params;
  
  try {
    // Extract order ID from receipt ID
    const orderId = receiptId.replace('receipt-', '');
    
    res.json({
      id: receiptId,
      orderId,
      orderNumber: `ORD-${orderId.slice(-6).toUpperCase()}`,
      storeName: 'Nimbus Cannabis',
      storeAddress: '123 Main St, San Francisco, CA',
      purchaseDate: new Date().toISOString(),
      subtotal: 45.00,
      tax: 3.94,
      discount: 0,
      total: 48.94,
      paymentMethod: 'Card ending in 4242',
      items: [
        {
          productId: 'prod-1',
          productName: 'Blue Dream 3.5g',
          quantity: 1,
          unitPrice: 45.00,
          totalPrice: 45.00,
          thcPercent: 22.5,
          batchNumber: 'BD-2024-001',
        },
      ],
      loyaltyPointsEarned: 48,
      pdfUrl: `/receipts/${receiptId}.pdf`,
    });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(500).json({ error: 'Failed to get receipt' });
  }
});

/**
 * POST /wallet/receipts/:receiptId/email
 * Email a receipt
 */
walletRouter.post('/wallet/receipts/:receiptId/email', requireAuth, async (req: Request, res: Response) => {
  const { receiptId } = req.params;
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // In production, send email
    console.log(`Emailing receipt ${receiptId} to ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Email receipt error:', error);
    res.status(500).json({ error: 'Failed to email receipt' });
  }
});

/**
 * GET /wallet/transactions
 * Get wallet transaction history
 */
walletRouter.get('/wallet/transactions', requireAuth, async (req: Request, res: Response) => {
  const { type, cursor } = req.query;
  
  try {
    // Mock transactions
    const transactions = [
      {
        id: 'tx-1',
        type: 'points_earn',
        amount: 48,
        balanceAfter: 548,
        description: 'Earned from purchase',
        orderId: 'order-123',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-2',
        type: 'gift_card_use',
        amount: -25.00,
        balanceAfter: 25.00,
        description: 'Applied to order',
        orderId: 'order-122',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-3',
        type: 'points_redeem',
        amount: -100,
        balanceAfter: 500,
        description: 'Redeemed for $1 off',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    const filtered = type 
      ? transactions.filter(t => t.type === type)
      : transactions;
    
    res.json({
      transactions: filtered,
      hasMore: false,
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

/**
 * GET /wallet/store-credits
 * Get store credits
 */
walletRouter.get('/wallet/store-credits', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      credits: [
        {
          id: 'credit-1',
          amount: 5.00,
          reason: 'compensation',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          orderId: 'order-100',
        },
      ],
    });
  } catch (error) {
    console.error('Store credits error:', error);
    res.status(500).json({ error: 'Failed to get store credits' });
  }
});

/**
 * GET /wallet/coupons
 * Get user's digital coupons
 */
walletRouter.get('/wallet/coupons', requireAuth, async (req: Request, res: Response) => {
  const { includeUsed } = req.query;
  
  try {
    const coupons = [
      {
        id: 'coupon-1',
        code: 'WELCOME10',
        title: '10% Off Your Order',
        description: 'Welcome discount for new members',
        discountType: 'percent',
        discountValue: 10,
        minPurchase: 25,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        source: 'welcome',
      },
      {
        id: 'coupon-2',
        code: 'LOYALTY5',
        title: '$5 Off',
        description: 'Loyalty reward coupon',
        discountType: 'fixed',
        discountValue: 5,
        minPurchase: 40,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        source: 'loyalty',
      },
    ];
    
    res.json({ coupons });
  } catch (error) {
    console.error('Coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
});

/**
 * POST /wallet/coupons/clip
 * Clip/activate a coupon
 */
walletRouter.post('/wallet/coupons/clip', requireAuth, async (req: Request, res: Response) => {
  const { couponId } = req.body;
  
  if (!couponId) {
    return res.status(400).json({ error: 'couponId is required' });
  }
  
  try {
    res.json({
      id: couponId,
      code: 'CLIPPED10',
      title: '10% Off',
      description: 'Clipped coupon',
      discountType: 'percent',
      discountValue: 10,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      source: 'promo',
    });
  } catch (error) {
    console.error('Clip coupon error:', error);
    res.status(500).json({ error: 'Failed to clip coupon' });
  }
});

/**
 * POST /checkout/apply-wallet
 * Apply wallet balance at checkout
 */
walletRouter.post('/checkout/apply-wallet', requireAuth, async (req: Request, res: Response) => {
  const { orderId, usePoints, useGiftCards, useStoreCredit, maxAmount } = req.body;
  
  try {
    let appliedAmount = 0;
    
    if (usePoints) appliedAmount += 5.00; // Example: 500 points = $5
    if (useGiftCards) appliedAmount += 25.00;
    if (useStoreCredit) appliedAmount += 5.00;
    
    if (maxAmount && appliedAmount > maxAmount) {
      appliedAmount = maxAmount;
    }
    
    res.json({
      appliedAmount,
      remainingTotal: Math.max(0, 50 - appliedAmount), // Assuming $50 order
    });
  } catch (error) {
    console.error('Apply wallet error:', error);
    res.status(500).json({ error: 'Failed to apply wallet' });
  }
});

/**
 * GET /wallet/warranty/:productId
 * Get warranty info for a purchased product
 */
walletRouter.get('/wallet/warranty/:productId', requireAuth, async (req: Request, res: Response) => {
  const { productId } = req.params;
  
  try {
    // In production, query purchase history for warranty info
    res.json({
      hasWarranty: true,
      warrantyEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      warrantyType: '90-day satisfaction guarantee',
      receiptId: 'receipt-123',
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Warranty error:', error);
    res.status(500).json({ error: 'Failed to get warranty info' });
  }
});
