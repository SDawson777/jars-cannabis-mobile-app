// src/hooks/useLoyalty.ts
// Enhanced loyalty program with tiers, rewards, referrals and coupons
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface LoyaltyProfile {
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier?: number;
  memberSince: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
}

export interface LoyaltyTier {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  minPoints: number;
  multiplier: number;
  benefits: string[];
  badgeUrl?: string;
  color: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'product' | 'experience' | 'merchandise';
  imageUrl?: string;
  available: boolean;
  expiresAt?: string;
  termsAndConditions?: string;
  featured?: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus' | 'referral' | 'adjustment' | 'expire';
  points: number;
  balance: number;
  description: string;
  orderId?: string;
  rewardId?: string;
  createdAt: string;
}

export interface DigitalCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed' | 'bogo' | 'free_item';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  expiresAt: string;
  usedAt?: string;
  isActive: boolean;
  source: 'loyalty' | 'referral' | 'promo' | 'birthday' | 'welcome';
}

export interface ReferralInfo {
  code: string;
  referralUrl: string;
  earnPerReferral: number;
  refereeBonus: number;
  totalReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
}

/**
 * Hook to fetch user's loyalty profile
 */
export function useLoyaltyProfile() {
  return useQuery<LoyaltyProfile, Error>({
    queryKey: ['loyalty', 'profile'],
    queryFn: async () => {
      return clientGet<LoyaltyProfile>(phase4Client, '/loyalty/profile');
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all loyalty tiers
 */
export function useLoyaltyTiers() {
  return useQuery<LoyaltyTier[], Error>({
    queryKey: ['loyalty', 'tiers'],
    queryFn: async () => {
      const res = await clientGet<{ tiers: LoyaltyTier[] }>(phase4Client, '/loyalty/tiers');
      return res.tiers || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - tiers rarely change
  });
}

/**
 * Hook to fetch available rewards
 */
export function useLoyaltyRewards(category?: string) {
  return useQuery<LoyaltyReward[], Error>({
    queryKey: ['loyalty', 'rewards', category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : '';
      const res = await clientGet<{ rewards: LoyaltyReward[] }>(phase4Client, `/loyalty/rewards${params}`);
      return res.rewards || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to redeem a reward
 */
export function useRedeemReward() {
  const queryClient = useQueryClient();
  
  return useMutation<{ couponCode: string; expiresAt: string }, Error, string>({
    mutationFn: async (rewardId: string) => {
      const result = await clientPost<{ rewardId: string }, { couponCode: string; expiresAt: string }>(
        phase4Client,
        '/loyalty/redeem',
        { rewardId }
      );
      logEvent('loyalty_reward_redeemed', { rewardId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'coupons'] });
    },
  });
}

/**
 * Hook to fetch loyalty transaction history
 */
export function useLoyaltyTransactions(type?: LoyaltyTransaction['type']) {
  return useInfiniteQuery<{ transactions: LoyaltyTransaction[]; hasMore: boolean; nextCursor?: string }, Error>({
    queryKey: ['loyalty', 'transactions', type],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (pageParam) params.append('cursor', pageParam);
      params.append('limit', '20');
      
      return clientGet(phase4Client, `/loyalty/transactions?${params}`);
    },
    getNextPageParam: (lastPage: { transactions: LoyaltyTransaction[]; hasMore: boolean; nextCursor?: string }) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch referral program info
 */
export function useReferralInfo() {
  return useQuery<ReferralInfo, Error>({
    queryKey: ['loyalty', 'referral'],
    queryFn: async () => {
      return clientGet<ReferralInfo>(phase4Client, '/loyalty/referral');
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to send referral invitation
 */
export function useSendReferral() {
  return useMutation<{ sent: boolean }, Error, { email?: string; phone?: string }>({
    mutationFn: async ({ email, phone }: { email?: string; phone?: string }) => {
      const result = await clientPost<{ email?: string; phone?: string }, { sent: boolean }>(
        phase4Client,
        '/loyalty/referral/send',
        { email, phone }
      );
      logEvent('referral_sent', { method: email ? 'email' : 'sms' });
      return result;
    },
  });
}

/**
 * Hook to apply referral code (for new users)
 */
export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; bonusPoints: number }, Error, string>({
    mutationFn: async (code: string) => {
      const result = await clientPost<{ code: string }, { success: boolean; bonusPoints: number }>(
        phase4Client,
        '/loyalty/referral/apply',
        { code }
      );
      logEvent('referral_code_applied', { code });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
}

/**
 * Hook to fetch user's digital coupons
 */
export function useDigitalCoupons(includeUsed: boolean = false) {
  return useQuery<DigitalCoupon[], Error>({
    queryKey: ['wallet', 'coupons', includeUsed],
    queryFn: async () => {
      const params = includeUsed ? '?includeUsed=true' : '';
      const res = await clientGet<{ coupons: DigitalCoupon[] }>(phase4Client, `/wallet/coupons${params}`);
      return res.coupons || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to clip/activate a coupon
 */
export function useClipCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation<DigitalCoupon, Error, string>({
    mutationFn: async (couponId: string) => {
      const result = await clientPost<{ couponId: string }, DigitalCoupon>(
        phase4Client,
        '/wallet/coupons/clip',
        { couponId }
      );
      logEvent('coupon_clipped', { couponId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'coupons'] });
    },
  });
}

/**
 * Hook to calculate points for a purchase
 */
export function useCalculatePoints(cartTotal: number) {
  const { data: profile } = useLoyaltyProfile();
  
  const basePoints = Math.floor(cartTotal);
  const multiplier = profile?.tier?.multiplier || 1;
  const earnedPoints = Math.floor(basePoints * multiplier);
  
  return {
    basePoints,
    multiplier,
    earnedPoints,
    tierName: profile?.tier?.name,
  };
}
