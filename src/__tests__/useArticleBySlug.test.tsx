import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArticleBySlug } from '../hooks/useArticleBySlug';
import { cmsClient } from '../api/cmsClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../context/CMSPreviewContext', () => ({
  useCMSPreview: () => ({ preview: false }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useArticleBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should fetch article by slug', async () => {
    const mockArticle = {
      __id: 'article-1',
      title: 'Test Article',
      slug: 'test-article',
      body: 'Article content',
    };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockArticle });

    const { result } = renderHook(() => useArticleBySlug('test-article'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockArticle);
  });

  it('should not fetch when slug is empty', () => {
    const { result } = renderHook(() => useArticleBySlug(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('should cache article in AsyncStorage', async () => {
    const mockArticle = {
      __id: 'article-2',
      title: 'Cached Article',
      slug: 'cached-article',
      body: 'Content',
    };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockArticle });

    renderHook(() => useArticleBySlug('cached-article'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('cached-article'),
        expect.any(String)
      );
    });
  });

  it('should return cached article on error', async () => {
    const cachedArticle = {
      __id: 'article-3',
      title: 'Cached Article',
      slug: 'cached',
      body: 'Cached content',
    };
    (cmsClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedArticle));

    const { result } = renderHook(() => useArticleBySlug('cached'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedArticle);
  });
});
