import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEducationalArticles } from '../hooks/useEducationalArticles';
import { cmsClient } from '../api/cmsClient';

jest.mock('../api/cmsClient');
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));
jest.mock('../context/CMSPreviewContext', () => ({
  useCMSPreview: () => ({ isPreview: false }),
}));

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

describe('useEducationalArticles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should fetch articles successfully', async () => {
    const mockArticles = [
      { id: '1', slug: 'article-1', title: 'Cannabis 101', content: 'Learn about...' },
      { id: '2', slug: 'article-2', title: 'Terpenes Guide', content: 'Discover...' },
    ];
    mockedCmsClient.get.mockResolvedValue({ data: mockArticles });

    const { result } = renderHook(() => useEducationalArticles(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockArticles);
    expect(mockedCmsClient.get).toHaveBeenCalledWith('/content/articles', { headers: undefined });
  });

  it('should handle empty articles list', async () => {
    mockedCmsClient.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useEducationalArticles(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockedCmsClient.get.mockRejectedValue(new Error('Failed to fetch articles'));

    const { result } = renderHook(() => useEducationalArticles(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch articles');
  });
});
