import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useHomeBanners } from '../hooks/useHomeBanners';
import { cmsClient } from '../api/cmsClient';

jest.mock('../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useHomeBanners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return banners when loaded', async () => {
    const mockBanners = [
      { __id: '1', title: 'Banner 1', image: { url: 'img1.jpg', alt: 'alt1' } },
      { __id: '2', title: 'Banner 2', image: { url: 'img2.jpg', alt: 'alt2' } },
    ];
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockBanners });

    const { result } = renderHook(() => useHomeBanners(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBanners);
  });

  it('should start in loading state', () => {
    (cmsClient.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useHomeBanners(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch banners');
    (cmsClient.get as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useHomeBanners(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should call cmsClient with correct URL', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: [] });

    renderHook(() => useHomeBanners(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(cmsClient.get).toHaveBeenCalledWith('/api/admin/banners');
    });
  });
});
