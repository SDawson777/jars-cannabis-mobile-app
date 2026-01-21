import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useForYouToday } from '../../hooks/useForYouToday';
import * as http from '../../api/http';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
}));

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

describe('useForYouToday hook', () => {
  const mockPayload = {
    greeting: 'Good morning!',
    recommendations: [{ id: 'prod-1', name: 'Blue Dream', score: 0.95 }],
    deals: [{ id: 'deal-1', title: '20% off Flower' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch for you today data when online', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockPayload);

    const { result } = renderHook(() => useForYouToday('user-123', 'store-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPayload);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/personalization/home?userId=user-123&storeId=store-456'
    );
  });

  it('should cache data after successful fetch', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockPayload);

    const { result } = renderHook(() => useForYouToday('user-123', 'store-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should use cache when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPayload));

    const { result } = renderHook(() => useForYouToday('user-123', 'store-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPayload);
    expect(http.clientGet).not.toHaveBeenCalled();
  });

  it('should fallback to cache on API error', async () => {
    (http.clientGet as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPayload));

    const { result } = renderHook(() => useForYouToday('user-123', 'store-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPayload);
  });

  it('should not fetch when userId is missing', () => {
    const { result } = renderHook(() => useForYouToday(undefined, 'store-456'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(http.clientGet).not.toHaveBeenCalled();
  });

  it('should not fetch when storeId is missing', () => {
    const { result } = renderHook(() => useForYouToday('user-123', undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(http.clientGet).not.toHaveBeenCalled();
  });

  it('should throw when offline and no cache', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useForYouToday('user-123', 'store-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Offline');
  });
});
