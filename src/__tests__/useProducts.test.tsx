import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProducts } from '../hooks/useProducts';
import * as http from '../api/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../api/http', () => ({
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
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should fetch products', async () => {
    const mockProducts = [
      { __id: 'p1', name: 'Product 1', price: 10 },
      { __id: 'p2', name: 'Product 2', price: 20 },
    ];
    (http.clientGet as jest.Mock).mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useProducts('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].products).toEqual(mockProducts);
  });

  it('should cache products in AsyncStorage', async () => {
    const mockProducts = [{ __id: 'p1', name: 'Product 1', price: 10 }];
    (http.clientGet as jest.Mock).mockResolvedValue({ products: mockProducts });

    renderHook(() => useProducts('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('store-1'),
        expect.any(String)
      );
    });
  });

  it('should return cached products when offline', async () => {
    const cachedProducts = [{ __id: 'p1', name: 'Cached Product', price: 10 }];
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ products: cachedProducts, page: 1, hasNextPage: false })
    );

    const { result } = renderHook(() => useProducts('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].products).toEqual(cachedProducts);
  });

  it('should fall back to cache on error', async () => {
    const cachedProducts = [{ __id: 'p1', name: 'Cached Product', price: 10 }];
    (http.clientGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ products: cachedProducts, page: 1, hasNextPage: false })
    );

    const { result } = renderHook(() => useProducts('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].products).toEqual(cachedProducts);
  });

  it('should handle pagination', async () => {
    const mockProducts = Array.from({ length: 20 }, (_, i) => ({
      __id: `p${i}`,
      name: `Product ${i}`,
      price: 10,
    }));
    (http.clientGet as jest.Mock).mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useProducts('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].hasNextPage).toBe(true);
  });
});
