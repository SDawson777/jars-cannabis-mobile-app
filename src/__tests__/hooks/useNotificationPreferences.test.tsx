/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

import { clientGet } from '../../api/http';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('fetches preferences from server', async () => {
    const mockPrefs = {
      orderConfirmation: true,
      orderPreparing: true,
      orderReady: true,
      orderOutForDelivery: true,
      orderDelivered: true,
      dailyDeals: false,
      flashSales: true,
      personalizedOffers: true,
      newProductAlerts: true,
      pointsEarned: true,
      rewardsAvailable: true,
      tierUpgrade: true,
      pointsExpiring: false,
      recallAlerts: true,
      complianceUpdates: true,
      securityAlerts: true,
      accountUpdates: true,
      backInStock: true,
      priceDrops: false,
      recommendationsDigest: false,
      quietHoursEnabled: false,
    };
    (clientGet as jest.Mock).mockResolvedValue(mockPrefs);

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPrefs);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('falls back to local storage on server error', async () => {
    const cachedPrefs = {
      orderConfirmation: true,
      dailyDeals: false,
      quietHoursEnabled: true,
    };
    (clientGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedPrefs));

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedPrefs);
  });

  it('returns default preferences when no cache exists', async () => {
    (clientGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should have default values
    expect(result.current.data?.orderConfirmation).toBe(true);
    expect(result.current.data?.recallAlerts).toBe(true);
    expect(result.current.data?.quietHoursEnabled).toBe(false);
  });

  it('caches server response locally', async () => {
    const mockPrefs = { orderConfirmation: true };
    (clientGet as jest.Mock).mockResolvedValue(mockPrefs);

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@nimbus:notification_preferences',
      JSON.stringify(mockPrefs)
    );
  });
});
