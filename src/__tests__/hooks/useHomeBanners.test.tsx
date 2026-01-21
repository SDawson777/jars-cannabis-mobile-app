/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useHomeBanners } from '../../hooks/useHomeBanners';
import { cmsClient } from '../../api/cmsClient';

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

const mockCmsClient = cmsClient as jest.Mocked<typeof cmsClient>;

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

describe('useHomeBanners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches home banners', async () => {
    const mockBanners = [
      { id: 'b1', title: 'Welcome Banner', imageUrl: 'banner1.jpg' },
      { id: 'b2', title: 'Promo Banner', imageUrl: 'banner2.jpg' },
    ];
    mockCmsClient.get.mockResolvedValue({ data: mockBanners });

    const { result } = renderHook(() => useHomeBanners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBanners);
  });

  it('returns loading state initially', () => {
    mockCmsClient.get.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useHomeBanners(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles errors', async () => {
    const error = new Error('Failed to fetch');
    mockCmsClient.get.mockRejectedValue(error);

    const { result } = renderHook(() => useHomeBanners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('calls correct endpoint', async () => {
    mockCmsClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useHomeBanners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockCmsClient.get).toHaveBeenCalledWith('/api/admin/banners');
    });
  });

  it('returns empty array when no banners', async () => {
    mockCmsClient.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useHomeBanners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
