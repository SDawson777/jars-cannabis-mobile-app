import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useDeals, useAllDeals } from '../../hooks/useDeals';
import { cmsClient } from '../../api/cmsClient';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDeals hook', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const mockDeals = [
    {
      id: 'deal-1',
      title: 'Active Deal',
      startDate: yesterday.toISOString(),
      endDate: tomorrow.toISOString(),
      discount: '20%',
    },
    {
      id: 'deal-2',
      title: 'Expired Deal',
      startDate: lastWeek.toISOString(),
      endDate: yesterday.toISOString(),
      discount: '10%',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch deals when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDeals });

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith('/content/deals');
  });

  it('should filter to only active deals', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDeals });

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should only have the active deal, not the expired one
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe('Active Deal');
  });

  it('should cache fetched deals', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDeals });

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cms:deals', JSON.stringify(mockDeals));
  });

  it('should use cache when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockDeals));

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should handle API response with items wrapper', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: { items: mockDeals } });

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('should fallback to cache on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockDeals));

    const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAllDeals hook', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const mockDeals = [
    {
      id: 'deal-1',
      title: 'Active Deal',
      startDate: yesterday.toISOString(),
      endDate: tomorrow.toISOString(),
    },
    {
      id: 'deal-2',
      title: 'Expired Deal',
      startDate: lastWeek.toISOString(),
      endDate: yesterday.toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should return all deals without filtering', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDeals });

    const { result } = renderHook(() => useAllDeals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have all deals including expired ones
    expect(result.current.data).toHaveLength(2);
  });
});
