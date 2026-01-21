import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useCategories } from '../../hooks/useCategories';
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

describe('useCategories hook', () => {
  const mockFilters = [
    { id: 'flower', label: 'Flower', slug: 'flower' },
    { id: 'vapes', label: 'Vapes', slug: 'vapes' },
    { id: 'edibles', label: 'Edibles', slug: 'edibles' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch categories when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFilters });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalled();
  });

  it('should transform filters into categories with emojis', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFilters });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBe(3);

    const flowerCategory = result.current.data?.find(c => c.id === 'flower');
    expect(flowerCategory?.emoji).toBe('🌿');
    expect(flowerCategory?.label).toBe('Flower');
  });

  it('should cache fetched categories', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFilters });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cms:categories', expect.any(String));
  });

  it('should use cache when offline', async () => {
    const cachedCategories = [{ id: 'flower', label: 'Flower', emoji: '🌿' }];
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedCategories));

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(cachedCategories);
    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should fallback to cache on API error', async () => {
    const cachedCategories = [{ id: 'flower', label: 'Flower' }];
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedCategories));

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(cachedCategories);
  });

  it('should use default emoji when category not in mapping', async () => {
    const unknownCategories = [{ id: 'unknown-category', label: 'Unknown' }];
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: unknownCategories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].emoji).toBe('📦');
  });
});
