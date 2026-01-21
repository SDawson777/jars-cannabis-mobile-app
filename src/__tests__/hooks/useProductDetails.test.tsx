import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useProductDetails } from '../../hooks/useProductDetails';

// Mock dependencies
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

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

const { clientGet } = require('../../api/http');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns undefined when productId is undefined', () => {
    const { result } = renderHook(() => useProductDetails(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
  });

  it('fetches product details successfully', async () => {
    const mockProduct = {
      id: 'prod-1',
      name: 'Blue Dream',
      price: 29.99,
    };
    const mockVariants = [{ id: 'v1', name: '1g', price: 15, stock: 10 }];

    (clientGet as jest.Mock).mockResolvedValue({
      product: mockProduct,
      variants: mockVariants,
    });

    const { result } = renderHook(() => useProductDetails('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.product).toEqual(mockProduct);
    expect(result.current.data?.variants).toEqual(mockVariants);
  });

  it('uses cached data when offline', async () => {
    const cachedData = {
      product: { id: 'prod-1', name: 'Cached Product' },
      variants: [],
    };

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useProductDetails('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.product.name).toBe('Cached Product');
  });

  it('caches fetched data in AsyncStorage', async () => {
    const mockProduct = { id: 'prod-1', name: 'Test Product' };

    (clientGet as jest.Mock).mockResolvedValue({ product: mockProduct, variants: [] });

    const { result } = renderHook(() => useProductDetails('prod-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'productDetails:prod-1:store-1',
      expect.any(String)
    );
  });

  it('falls back to cache on fetch error', async () => {
    const cachedData = {
      product: { id: 'prod-1', name: 'Fallback Product' },
      variants: [],
    };

    (clientGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useProductDetails('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.product.name).toBe('Fallback Product');
  });
});
