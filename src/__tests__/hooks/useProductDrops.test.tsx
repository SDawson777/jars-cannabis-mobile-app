/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useProductDrops } from '../../hooks/useProductDrops';
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

describe('useProductDrops', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches product drops', async () => {
    const mockDrops = [
      { id: 'd1', title: 'New Drop', products: [] },
      { id: 'd2', title: 'Featured Drop', products: [] },
    ];
    mockCmsClient.get.mockResolvedValue({ data: mockDrops });

    const { result } = renderHook(() => useProductDrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDrops);
  });

  it('returns loading state initially', () => {
    mockCmsClient.get.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useProductDrops(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles errors', async () => {
    const error = new Error('Failed to fetch');
    mockCmsClient.get.mockRejectedValue(error);

    const { result } = renderHook(() => useProductDrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('calls correct endpoint', async () => {
    mockCmsClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useProductDrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockCmsClient.get).toHaveBeenCalledWith('/api/admin/drops');
    });
  });
});
