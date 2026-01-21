// src/__tests__/hooks/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProducts } from '../../hooks/useProducts';
import { clientGet } from '../../api/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
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

describe('useProducts hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch products when online', async () => {
    const mockProducts = {
      products: [
        { id: 'prod-1', name: 'Product 1', slug: 'product-1' },
        { id: 'prod-2', name: 'Product 2', slug: 'product-2' },
      ],
    };
    (clientGet as jest.Mock).mockResolvedValue(mockProducts);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].products).toHaveLength(2);
  });

  it('should pass storeId to API', async () => {
    const mockProducts = { products: [] };
    (clientGet as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts('store-123'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/products',
      expect.objectContaining({
        params: expect.objectContaining({ storeId: 'store-123' }),
      })
    );
  });

  it('should pass filter to API', async () => {
    const mockProducts = { products: [] };
    (clientGet as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(undefined, 'indica'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/products',
      expect.objectContaining({
        params: expect.objectContaining({ filter: 'indica' }),
      })
    );
  });

  it('should use cached data when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const cachedData = {
      products: [{ id: 'cached-1', name: 'Cached Product' }],
      page: 1,
      hasNextPage: false,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].products[0].name).toBe('Cached Product');
  });

  it('should cache fetched data', async () => {
    const mockProducts = { products: [{ id: 'prod-1', name: 'Product' }] };
    (clientGet as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should throw error when offline and no cache', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Offline');
  });
});
