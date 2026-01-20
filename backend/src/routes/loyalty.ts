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

// Tier hierarchy for checking minimum tier requirements
const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
function meetsMinTier(userTier: string, minTier: string | null): boolean {
  if (!minTier) return true;
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(minTier);
}

/**
 * GET /loyalty/rewards
 * Get available rewards for redemption from database
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

    // Query rewards from database
    const whereClause: any = { isActive: true };
    if (category) {
      whereClause.category = String(category);
    }

    const dbRewards = await prisma.reward.findMany({
      where: whereClause,
      orderBy: { pointsCost: 'asc' },
    });

    // Map rewards with availability based on user's points and tier
    const rewards = dbRewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      imageUrl: reward.imageUrl || `/rewards/${reward.category}.png`,
      isAvailable: userPoints >= reward.pointsCost && meetsMinTier(userTier, reward.minTier),
      minTier: reward.minTier,
      expiresAfterRedemption: reward.expiresAfterRedemption,
    }));

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

    // Verify reward exists and check points/tier requirements
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (!reward.isActive) {
      return res.status(400).json({ error: 'Reward is no longer available' });
    }

    if (status.points < reward.pointsCost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    if (reward.minTier && !meetsMinTier(status.tier, reward.minTier)) {
      return res
        .status(400)
        .json({ error: `This reward requires ${reward.minTier} tier or higher` });
    }

    // Generate unique redemption code
    const code = `REWARD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + reward.expiresAfterRedemption * 24 * 60 * 60 * 1000);

    // Create redemption record and deduct points in a transaction
    const [redemption] = await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: {
          rewardId: reward.id,
          userId: uid,
          code,
          expiresAt,
          status: 'active',
        },
      }),
      prisma.loyaltyStatus.update({
        where: { userId: uid },
        data: { points: status.points - reward.pointsCost },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: uid,
          type: 'redeem',
          amount: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
        },
      }),
    ]);

    res.json({
      redemption: {
        id: redemption.id,
        rewardId: redemption.rewardId,
        redeemedAt: redemption.redeemedAt.toISOString(),
        expiresAt: redemption.expiresAt.toISOString(),
        code: redemption.code,
        status: redemption.status,
      },
      pointsRemaining: status.points - reward.pointsCost,
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

/**
 * GET /loyalty/transactions
 * Get points transaction history from database
 */
loyaltyRouter.get('/loyalty/transactions', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { cursor, limit = '20' } = req.query;

  try {
    const take = Math.min(parseInt(limit as string) || 20, 100);

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // Fetch one extra to check if there are more
      ...(cursor ? { cursor: { id: String(cursor) }, skip: 1 } : {}),
    });

    const hasMore = transactions.length > take;
    const items = hasMore ? transactions.slice(0, take) : transactions;

    res.json({
      transactions: items.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        orderId: tx.orderId,
        createdAt: tx.createdAt.toISOString(),
      })),
      hasMore,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
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
 * Get referral program info from database
 */
loyaltyRouter.get('/loyalty/referral', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;

  try {
    // Get referral stats from database
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: uid },
      orderBy: { createdAt: 'desc' },
    });

    const completedReferrals = referrals.filter(r => r.status === 'completed');
    const pendingReferrals = referrals.filter(r => r.status === 'pending');

    res.json({
      referralCode: `NIMBUS${uid.slice(-6).toUpperCase()}`,
      referralLink: `https://nimbus.app/join?ref=NIMBUS${uid.slice(-6).toUpperCase()}`,
      referrerReward: 500,
      refereeReward: 500,
      totalReferrals: completedReferrals.length,
      pendingReferrals: pendingReferrals.length,
      referrals: referrals.map(r => ({
        id: r.id,
        refereeName: r.refereeEmail ? r.refereeEmail.split('@')[0] : 'Anonymous',
        status: r.status,
        pointsEarned: r.pointsEarned,
        ...(r.status === 'completed'
          ? { completedAt: r.completedAt?.toISOString() }
          : { createdAt: r.createdAt.toISOString() }),
      })),
    });
  } catch (error) {
    console.error('Referral info error:', error);
    res.status(500).json({ error: 'Failed to get referral info' });
  }
});

/**
 * POST /loyalty/referral/send
 * Send a referral invite and track in database
 */
loyaltyRouter.post('/loyalty/referral/send', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { email, phone, method } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  try {
    // Create referral record in database
    await prisma.referral.create({
      data: {
        referrerUserId: uid,
        refereeEmail: email || undefined,
        refereePhone: phone || undefined,
        status: 'pending',
      },
    });

    // In production, would also send email/SMS here
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
    // Extract referrer ID from code (format: NIMBUS + last 6 chars of user ID)
    const referrerId = referralCode.replace('NIMBUS', '').toLowerCase();

    // Find pending referral for this referee
    const referral = await prisma.referral.findFirst({
      where: {
        referrerUserId: { endsWith: referrerId },
        status: 'pending',
      },
    });

    // Update referral to completed and award points
    await prisma.$transaction([
      // Award points to referee
      prisma.loyaltyStatus.upsert({
        where: { userId: uid },
        update: { points: { increment: 500 } },
        create: { userId: uid, points: 500, tier: 'Bronze' },
      }),
      // Record transaction for referee
      prisma.loyaltyTransaction.create({
        data: {
          userId: uid,
          type: 'referral',
          amount: 500,
          description: 'Referral welcome bonus',
        },
      }),
      // If referral record exists, update and award referrer
      ...(referral
        ? [
            prisma.referral.update({
              where: { id: referral.id },
              data: {
                refereeUserId: uid,
                status: 'completed',
                pointsEarned: 500,
                completedAt: new Date(),
              },
            }),
            prisma.loyaltyStatus.upsert({
              where: { userId: referral.referrerUserId },
              update: { points: { increment: 500 } },
              create: { userId: referral.referrerUserId, points: 500, tier: 'Bronze' },
            }),
            prisma.loyaltyTransaction.create({
              data: {
                userId: referral.referrerUserId,
                type: 'referral',
                amount: 500,
                description: 'Referral bonus',
              },
            }),
          ]
        : []),
    ]);

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
 * Get user's digital coupons from database
 */
loyaltyRouter.get('/loyalty/coupons', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { includeUsed } = req.query;

  try {
    // Get user's coupons with their clip/use status
    const userCoupons = await prisma.userCoupon.findMany({
      where: {
        userId: uid,
        ...(includeUsed !== 'true' ? { isUsed: false } : {}),
      },
      include: {
        coupon: true,
      },
    });

    // Also get active coupons not yet assigned to user
    const userCouponIds = userCoupons.map(uc => uc.couponId);
    const availableCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        id: { notIn: userCouponIds },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const coupons = [
      // User's assigned coupons
      ...userCoupons.map(uc => ({
        id: uc.coupon.id,
        code: uc.coupon.code,
        title: uc.coupon.title,
        description: uc.coupon.description,
        discountType: uc.coupon.discountType,
        discountValue: uc.coupon.discountValue,
        minPurchase: uc.coupon.minPurchase,
        maxDiscount: uc.coupon.maxDiscount,
        expiresAt: uc.coupon.expiresAt?.toISOString(),
        isClipped: uc.isClipped,
        isUsed: uc.isUsed,
        applicableCategories:
          uc.coupon.applicableCategories.length > 0 ? uc.coupon.applicableCategories : ['all'],
        source: uc.coupon.source,
      })),
      // Available coupons not yet clipped
      ...availableCoupons.map(c => ({
        id: c.id,
        code: c.code,
        title: c.title,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minPurchase: c.minPurchase,
        maxDiscount: c.maxDiscount,
        expiresAt: c.expiresAt?.toISOString(),
        isClipped: false,
        isUsed: false,
        applicableCategories: c.applicableCategories.length > 0 ? c.applicableCategories : ['all'],
        source: c.source,
      })),
    ];

    res.json({ coupons });
  } catch (error) {
    console.error('Coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
});

/**
 * POST /loyalty/coupons/clip
 * Clip (activate) a coupon in database
 */
loyaltyRouter.post('/loyalty/coupons/clip', requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).user.userId as string;
  const { couponId } = req.body;

  if (!couponId) {
    return res.status(400).json({ error: 'couponId is required' });
  }

  try {
    // Verify coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Create or update UserCoupon record
    const userCoupon = await prisma.userCoupon.upsert({
      where: {
        userId_couponId: { userId: uid, couponId },
      },
      update: {
        isClipped: true,
        clippedAt: new Date(),
      },
      create: {
        userId: uid,
        couponId,
        isClipped: true,
        clippedAt: new Date(),
      },
    });

    res.json({
      success: true,
      coupon: {
        id: couponId,
        isClipped: userCoupon.isClipped,
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
