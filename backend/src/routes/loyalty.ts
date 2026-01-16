import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth, optionalAuth } from '../middleware/auth';

export const loyaltyRouter = Router();

/**
 * GET /loyalty/status
 * Get user's loyalty status (renamed to profile for v2)
 */
loyaltyRouter.get('/loyalty/status', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const status = await prisma.loyaltyStatus.upsert({
    where: { userId: uid },
    update: {},
    create: { userId: uid, points: 0, tier: 'Bronze' },
  });
  res.json(status);
});

/**
 * GET /loyalty/profile
 * Get detailed loyalty profile with tier progress
 */
loyaltyRouter.get('/loyalty/profile', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    const status = await prisma.loyaltyStatus.upsert({
      where: { userId: uid },
      update: {},
      create: { userId: uid, points: 0, tier: 'Bronze' },
    });

    // Calculate tier progress
    const tierThresholds: Record<string, { min: number; max: number; next: string | null }> = {
      Bronze: { min: 0, max: 1000, next: 'Silver' },
      Silver: { min: 1000, max: 5000, next: 'Gold' },
      Gold: { min: 5000, max: 15000, next: 'Platinum' },
      Platinum: { min: 15000, max: 50000, next: 'Diamond' },
      Diamond: { min: 50000, max: Infinity, next: null },
    };

    const currentTier = tierThresholds[status.tier] || tierThresholds.Bronze;
    const lifetimePoints = status.points; // In production, track separately
    const pointsToNextTier = currentTier.next ? Math.max(0, currentTier.max - lifetimePoints) : 0;

    res.json({
      userId: uid,
      currentTier: status.tier,
      points: status.points,
      lifetimePoints,
      pointsToNextTier,
      nextTier: currentTier.next,
      tierProgress: Math.min(
        100,
        ((lifetimePoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100
      ),
      memberSince: status.createdAt || new Date().toISOString(),
      referralCode: `NIMBUS${uid.slice(-6).toUpperCase()}`,
    });
  } catch (error) {
    console.error('Loyalty profile error:', error);
    res.status(500).json({ error: 'Failed to get loyalty profile' });
  }
});

/**
 * GET /loyalty/tiers
 * Get all loyalty tiers with benefits
 */
loyaltyRouter.get('/loyalty/tiers', optionalAuth, async (req: Request, res: Response) => {
  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      pointsMultiplier: 1.0,
      color: '#CD7F32',
      benefits: ['Earn 1 point per dollar spent', 'Birthday reward', 'Member-only offers'],
    },
    {
      id: 'silver',
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 4999,
      pointsMultiplier: 1.25,
      color: '#C0C0C0',
      benefits: [
        '1.25x points multiplier',
        'Early access to new products',
        'Exclusive Silver discounts',
        'Free delivery on orders $50+',
      ],
    },
    {
      id: 'gold',
      name: 'Gold',
      minPoints: 5000,
      maxPoints: 14999,
      pointsMultiplier: 1.5,
      color: '#FFD700',
      benefits: [
        '1.5x points multiplier',
        'Priority customer support',
        'Monthly Gold-only deals',
        'Free delivery on all orders',
        'Early access to strain drops',
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minPoints: 15000,
      maxPoints: 49999,
      pointsMultiplier: 2.0,
      color: '#E5E4E2',
      benefits: [
        '2x points multiplier',
        'Exclusive Platinum events',
        'VIP customer support',
        'Free expedited delivery',
        'Annual loyalty gift',
        'Concierge ordering',
      ],
    },
    {
      id: 'diamond',
      name: 'Diamond',
      minPoints: 50000,
      maxPoints: null,
      pointsMultiplier: 3.0,
      color: '#B9F2FF',
      benefits: [
        '3x points multiplier',
        'Personal account manager',
        'First access to limited editions',
        'Exclusive Diamond pricing',
        'Private shopping experiences',
        'Quarterly premium gifts',
        'Priority order fulfillment',
      ],
    },
  ];

  res.json({ tiers });
});

/**
 * GET /loyalty/rewards
 * Get available rewards for redemption
 */
loyaltyRouter.get('/loyalty/rewards', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { category } = req.query;

  try {
    const status = await prisma.loyaltyStatus.findUnique({
      where: { userId: uid },
    });

    const userPoints = status?.points || 0;
    const userTier = status?.tier || 'Bronze';

    // Mock rewards catalog
    let rewards = [
      {
        id: 'reward-1',
        name: '$5 Off',
        description: 'Get $5 off your next order',
        pointsCost: 500,
        category: 'discount',
        imageUrl: '/rewards/5-off.png',
        isAvailable: userPoints >= 500,
        minTier: null,
        expiresAfterRedemption: 30, // days
      },
      {
        id: 'reward-2',
        name: '$10 Off',
        description: 'Get $10 off your next order',
        pointsCost: 1000,
        category: 'discount',
        imageUrl: '/rewards/10-off.png',
        isAvailable: userPoints >= 1000,
        minTier: null,
        expiresAfterRedemption: 30,
      },
      {
        id: 'reward-3',
        name: 'Free Pre-Roll',
        description: 'Redeem for a free house pre-roll',
        pointsCost: 750,
        category: 'product',
        imageUrl: '/rewards/preroll.png',
        isAvailable: userPoints >= 750,
        minTier: 'Silver',
        expiresAfterRedemption: 14,
      },
      {
        id: 'reward-4',
        name: 'Free Delivery',
        description: 'Get free delivery on your next order',
        pointsCost: 300,
        category: 'service',
        imageUrl: '/rewards/delivery.png',
        isAvailable: userPoints >= 300,
        minTier: null,
        expiresAfterRedemption: 7,
      },
      {
        id: 'reward-5',
        name: '25% Off Order',
        description: 'Get 25% off your entire order (max $50)',
        pointsCost: 2500,
        category: 'discount',
        imageUrl: '/rewards/25-off.png',
        isAvailable: userPoints >= 2500,
        minTier: 'Gold',
        expiresAfterRedemption: 14,
      },
      {
        id: 'reward-6',
        name: 'Premium Merch',
        description: 'Redeem for exclusive Nimbus merchandise',
        pointsCost: 5000,
        category: 'merchandise',
        imageUrl: '/rewards/merch.png',
        isAvailable: userPoints >= 5000,
        minTier: 'Platinum',
        expiresAfterRedemption: 60,
      },
    ];

    if (category) {
      rewards = rewards.filter(r => r.category === category);
    }

    res.json({
      rewards,
      userPoints,
      userTier,
    });
  } catch (error) {
    console.error('Rewards error:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

/**
 * POST /loyalty/rewards/redeem
 * Redeem a reward
 */
loyaltyRouter.post('/loyalty/rewards/redeem', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { rewardId } = req.body;

  if (!rewardId) {
    return res.status(400).json({ error: 'rewardId is required' });
  }

  try {
    const status = await prisma.loyaltyStatus.findUnique({
      where: { userId: uid },
    });

    if (!status) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    // In production, verify reward exists and check points/tier requirements
    const pointsCost = 500; // Example

    if (status.points < pointsCost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Deduct points
    await prisma.loyaltyStatus.update({
      where: { userId: uid },
      data: { points: status.points - pointsCost },
    });

    const redemption = {
      id: `redemption-${Date.now()}`,
      rewardId,
      redeemedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      code: `REWARD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: 'active',
    };

    res.json({
      redemption,
      pointsRemaining: status.points - pointsCost,
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

/**
 * GET /loyalty/transactions
 * Get points transaction history
 */
loyaltyRouter.get('/loyalty/transactions', requireAuth, async (req: Request, res: Response) => {
  const _uid = (req as any).user.userId as string;
  const { cursor: _cursor, limit: _limit = '20' } = req.query;

  try {
    // Mock transactions
    const transactions = [
      {
        id: 'tx-1',
        type: 'earn',
        amount: 48,
        description: 'Purchase at Nimbus SF',
        orderId: 'order-123',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-2',
        type: 'bonus',
        amount: 100,
        description: 'Double points Tuesday',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-3',
        type: 'redeem',
        amount: -500,
        description: 'Redeemed: $5 Off',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-4',
        type: 'earn',
        amount: 125,
        description: 'Purchase at Nimbus Oakland',
        orderId: 'order-122',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-5',
        type: 'referral',
        amount: 500,
        description: 'Referral bonus: John D.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      transactions,
      hasMore: false,
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

loyaltyRouter.get('/loyalty/badges', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const items = await prisma.loyaltyBadge.findMany({
    where: { userId: uid },
    orderBy: { earnedAt: 'desc' },
  });
  res.json({ items });
});

/**
 * GET /loyalty/referral
 * Get referral program info
 */
loyaltyRouter.get('/loyalty/referral', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    res.json({
      referralCode: `NIMBUS${uid.slice(-6).toUpperCase()}`,
      referralLink: `https://nimbus.app/join?ref=NIMBUS${uid.slice(-6).toUpperCase()}`,
      referrerReward: 500,
      refereeReward: 500,
      totalReferrals: 3,
      pendingReferrals: 1,
      referrals: [
        {
          id: 'ref-1',
          refereeName: 'John D.',
          status: 'completed',
          pointsEarned: 500,
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ref-2',
          refereeName: 'Sarah M.',
          status: 'completed',
          pointsEarned: 500,
          completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ref-3',
          refereeName: 'Mike T.',
          status: 'pending',
          pointsEarned: 0,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Referral info error:', error);
    res.status(500).json({ error: 'Failed to get referral info' });
  }
});

/**
 * POST /loyalty/referral/send
 * Send a referral invite
 */
loyaltyRouter.post('/loyalty/referral/send', requireAuth, async (req: Request, res: Response) => {
  const { email, phone, method } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  try {
    // In production, send referral invite
    res.json({
      success: true,
      message: `Referral invite sent via ${method || 'email'}`,
    });
  } catch (error) {
    console.error('Send referral error:', error);
    res.status(500).json({ error: 'Failed to send referral' });
  }
});

/**
 * POST /loyalty/referral/apply
 * Apply a referral code during signup
 */
loyaltyRouter.post('/loyalty/referral/apply', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ error: 'referralCode is required' });
  }

  try {
    // In production, validate code and apply bonus
    await prisma.loyaltyStatus.upsert({
      where: { userId: uid },
      update: { points: { increment: 500 } },
      create: { userId: uid, points: 500, tier: 'Bronze' },
    });

    res.json({
      success: true,
      pointsEarned: 500,
      message: 'Referral code applied! You earned 500 bonus points.',
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});

/**
 * GET /loyalty/coupons
 * Get user's digital coupons
 */
loyaltyRouter.get('/loyalty/coupons', requireAuth, async (req: Request, res: Response) => {
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
        maxDiscount: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isClipped: true,
        isUsed: false,
        applicableCategories: ['all'],
        source: 'welcome',
      },
      {
        id: 'coupon-2',
        code: 'GOLD15',
        title: '15% Off for Gold Members',
        description: 'Exclusive Gold tier discount',
        discountType: 'percent',
        discountValue: 15,
        minPurchase: 50,
        maxDiscount: 100,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isClipped: true,
        isUsed: false,
        applicableCategories: ['flower', 'concentrates'],
        source: 'tier_benefit',
      },
      {
        id: 'coupon-3',
        code: 'EDIBLE5',
        title: '$5 Off Edibles',
        description: 'Valid on any edible product',
        discountType: 'fixed',
        discountValue: 5,
        minPurchase: 20,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isClipped: false,
        isUsed: false,
        applicableCategories: ['edibles'],
        source: 'promo',
      },
    ];

    const filtered = includeUsed === 'true' ? coupons : coupons.filter(c => !c.isUsed);

    res.json({ coupons: filtered });
  } catch (error) {
    console.error('Coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
});

/**
 * POST /loyalty/coupons/clip
 * Clip (activate) a coupon
 */
loyaltyRouter.post('/loyalty/coupons/clip', requireAuth, async (req: Request, res: Response) => {
  const { couponId } = req.body;

  if (!couponId) {
    return res.status(400).json({ error: 'couponId is required' });
  }

  try {
    // In production, update coupon status in database
    res.json({
      success: true,
      coupon: {
        id: couponId,
        isClipped: true,
      },
    });
  } catch (error) {
    console.error('Clip coupon error:', error);
    res.status(500).json({ error: 'Failed to clip coupon' });
  }
});

/**
 * POST /loyalty/calculate-points
 * Calculate points that would be earned for a purchase
 */
loyaltyRouter.post(
  '/loyalty/calculate-points',
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = (req as any).user.userId as string;
    const { subtotal, productIds: _productIds } = req.body;

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({ error: 'Valid subtotal is required' });
    }

    try {
      const status = await prisma.loyaltyStatus.findUnique({
        where: { userId: uid },
      });

      const tier = status?.tier || 'Bronze';
      const multipliers: Record<string, number> = {
        Bronze: 1.0,
        Silver: 1.25,
        Gold: 1.5,
        Platinum: 2.0,
        Diamond: 3.0,
      };

      const multiplier = multipliers[tier] || 1.0;
      const basePoints = Math.floor(subtotal);
      const bonusPoints = Math.floor(basePoints * (multiplier - 1));
      const totalPoints = basePoints + bonusPoints;

      res.json({
        basePoints,
        bonusPoints,
        totalPoints,
        multiplier,
        tier,
      });
    } catch (error) {
      console.error('Calculate points error:', error);
      res.status(500).json({ error: 'Failed to calculate points' });
    }
  }
);
