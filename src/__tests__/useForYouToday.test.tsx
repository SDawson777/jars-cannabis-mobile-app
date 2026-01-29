import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useForYouToday } from '../hooks/useForYouToday';
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

describe('useForYouToday', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch when userId is undefined', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    const { result } = renderHook(() => useForYouToday(undefined, 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockedClientGet).not.toHaveBeenCalled();
  });

  it('should not fetch when storeId is undefined', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    const { result } = renderHook(() => useForYouToday('user-1', undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockedClientGet).not.toHaveBeenCalled();
  });

  it('should fetch and cache data when online', async () => {
    const mockData = { recommendations: [{ id: '1', name: 'Product 1' }] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockResolvedValue(mockData);
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForYouToday('user-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      'forYouToday:user-1:store-1',
      JSON.stringify(mockData)
    );
  });

  it('should return cached data when offline', async () => {
    const cachedData = { recommendations: [{ id: '2', name: 'Cached Product' }] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useForYouToday('user-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockedClientGet).not.toHaveBeenCalled();
  });

  it('should throw error when offline with no cache', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useForYouToday('user-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Offline');
  });

  it('should fallback to cache when API call fails', async () => {
    const cachedData = { recommendations: [{ id: '3', name: 'Fallback Product' }] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockRejectedValue(new Error('API Error'));
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useForYouToday('user-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
  });

  it('should throw error when API fails and no cache exists', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedClientGet.mockRejectedValue(new Error('API Error'));
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useForYouToday('user-1', 'store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('API Error');
  });
});
