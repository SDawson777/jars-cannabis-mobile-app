import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useLoyaltyProfile,
  useLoyaltyTiers,
  useLoyaltyRewards,
  useRedeemReward,
} from '../../hooks/useLoyalty';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLoyaltyProfile hook', () => {
  const mockProfile = {
    userId: 'user-123',
    points: 1500,
    lifetimePoints: 5000,
    tier: { id: 'gold', name: 'Gold', minPoints: 1000, multiplier: 1.5 },
    memberSince: '2023-01-01',
    referralCode: 'ABC123',
    referralCount: 5,
    referralEarnings: 250,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch loyalty profile', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useLoyaltyProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/loyalty/profile');
  });
});

describe('useLoyaltyTiers hook', () => {
  const mockTiers = [
    { id: 'bronze', name: 'Bronze', minPoints: 0, multiplier: 1.0 },
    { id: 'silver', name: 'Silver', minPoints: 500, multiplier: 1.25 },
    { id: 'gold', name: 'Gold', minPoints: 1000, multiplier: 1.5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch loyalty tiers', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ tiers: mockTiers });

    const { result } = renderHook(() => useLoyaltyTiers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTiers);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/loyalty/tiers');
  });

  it('should handle empty tiers response', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useLoyaltyTiers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useLoyaltyRewards hook', () => {
  const mockRewards = [
    { id: 'reward-1', name: '$10 Off', pointsCost: 500, category: 'discount', available: true },
    { id: 'reward-2', name: 'Free Item', pointsCost: 1000, category: 'product', available: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all rewards', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ rewards: mockRewards });

    const { result } = renderHook(() => useLoyaltyRewards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRewards);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/loyalty/rewards');
  });

  it('should fetch rewards by category', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ rewards: [mockRewards[0]] });

    const { result } = renderHook(() => useLoyaltyRewards('discount'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/loyalty/rewards?category=discount'
    );
  });
});

describe('useRedeemReward hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redeem a reward', async () => {
    const mockResult = { couponCode: 'REWARD-ABC123', expiresAt: '2024-12-31' };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useRedeemReward(), {
      wrapper: createWrapper(),
    });

    let redeemResult: any;
    await act(async () => {
      redeemResult = await result.current.mutateAsync('reward-1');
    });

    expect(redeemResult).toEqual(mockResult);
    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/loyalty/redeem', {
      rewardId: 'reward-1',
    });
    expect(logEvent).toHaveBeenCalledWith('loyalty_reward_redeemed', { rewardId: 'reward-1' });
  });

  it('should handle redemption error', async () => {
    (http.clientPost as jest.Mock).mockRejectedValueOnce(new Error('Insufficient points'));

    const { result } = renderHook(() => useRedeemReward(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('reward-1');
      })
    ).rejects.toThrow('Insufficient points');
  });
});
