import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProductDetails } from '../hooks/useProductDetails';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clientGet } from '../api/http';

jest.mock('@react-native-community/netinfo');
jest.mock('../api/http');

const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedClientGet = clientGet as jest.MockedFunction<typeof clientGet>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch when productId is undefined', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    const { result } = renderHook(() => useProductDetails(undefined), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockedClientGet).not.toHaveBeenCalled();
  });

  it('should fetch product details when online', async () => {
    const mockProduct = {
      product: { id: 'prod-1', name: 'Test Product', price: 29.99 },
      variants: [{ id: 'var-1', name: 'Small', price: 24.99, stock: 10 }],
    };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockResolvedValue(mockProduct);
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetails('prod-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProduct);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should return cached data when offline', async () => {
    const cachedData = {
      product: { id: 'prod-2', name: 'Cached Product', price: 19.99 },
      variants: [],
    };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useProductDetails('prod-2'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockedClientGet).not.toHaveBeenCalled();
  });

  it('should throw error when offline with no cache', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useProductDetails('prod-3'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Offline');
  });

  it('should fallback to cache when API fails', async () => {
    const cachedData = {
      product: { id: 'prod-4', name: 'Fallback', price: 15.99 },
      variants: [],
    };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockRejectedValue(new Error('API Error'));
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useProductDetails('prod-4'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
  });

  it('should normalize product response without variants', async () => {
    // API returns just the product without variants wrapper
    const productOnly = { id: 'prod-5', name: 'Single Product', price: 9.99 };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockResolvedValue(productOnly);
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetails('prod-5'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.product).toEqual(productOnly);
    expect(result.current.data?.variants).toEqual([]);
  });
});
