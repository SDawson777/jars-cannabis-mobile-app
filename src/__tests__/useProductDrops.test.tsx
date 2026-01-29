import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProductDrops } from '../hooks/useProductDrops';
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

describe('useProductDrops', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch product drops successfully', async () => {
    const mockDrops = [
      {
        id: 'drop-1',
        name: 'New Arrivals',
        products: ['prod-1', 'prod-2'],
        dropDate: '2026-01-25',
      },
      { id: 'drop-2', name: '420 Special', products: ['prod-3'], dropDate: '2026-04-20' },
    ];
    mockedCmsClient.get.mockResolvedValue({ data: mockDrops });

    const { result } = renderHook(() => useProductDrops(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDrops);
    expect(mockedCmsClient.get).toHaveBeenCalledWith('/api/admin/drops');
  });

  it('should handle empty drops list', async () => {
    mockedCmsClient.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useProductDrops(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockedCmsClient.get.mockRejectedValue(new Error('Failed to fetch drops'));

    const { result } = renderHook(() => useProductDrops(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch drops');
  });
});
