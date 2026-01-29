import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCMSProducts } from '../hooks/useCMSProducts';
import { cmsClient } from '../api/cmsClient';

jest.mock('../api/cmsClient');

const mockedCmsClient = cmsClient as jest.Mocked<typeof cmsClient>;

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

describe('useCMSProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    const mockProducts = [
      { id: 'prod-1', name: 'Blue Dream', price: 45.0, category: 'Flower' },
      { id: 'prod-2', name: 'OG Kush', price: 50.0, category: 'Flower' },
    ];
    mockedCmsClient.get.mockResolvedValue({ data: mockProducts });

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProducts);
    expect(mockedCmsClient.get).toHaveBeenCalledWith('/api/admin/products');
  });

  it('should handle empty products list', async () => {
    mockedCmsClient.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockedCmsClient.get.mockRejectedValue(new Error('Failed to fetch products'));

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch products');
  });

  it('should expose loading state', async () => {
    mockedCmsClient.get.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ data: [] }), 100);
        })
    );

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
