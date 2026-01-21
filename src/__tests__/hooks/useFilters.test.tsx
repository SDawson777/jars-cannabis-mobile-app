/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFiltersQuery } from '../../hooks/useFilters';

// Mock dependencies
jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

jest.mock('../../context/CMSPreviewContext', () => ({
  useCMSPreview: () => ({ preview: false }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { cmsClient } from '../../api/cmsClient';

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

describe('useFiltersQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('fetches filters successfully', async () => {
    const mockFilters = [
      { id: 'category', label: 'Category', type: 'select', options: ['Flower', 'Edibles'] },
      { id: 'brand', label: 'Brand', type: 'select', options: ['Brand A', 'Brand B'] },
    ];
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockFilters });

    const { result } = renderHook(() => useFiltersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFilters);
    expect(cmsClient.get).toHaveBeenCalledWith('/content/filters', expect.any(Object));
  });

  it('handles error state', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch filters'));

    const { result } = renderHook(() => useFiltersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('returns loading state initially', () => {
    (cmsClient.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useFiltersQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it('handles empty filters array', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useFiltersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
