import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useArticleBySlug } from '../../hooks/useArticleBySlug';
import * as CMSPreviewModule from '../../context/CMSPreviewContext';
import { cmsClient } from '../../api/cmsClient';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../context/CMSPreviewContext', () => ({
  useCMSPreview: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useArticleBySlug hook', () => {
  const mockArticle = {
    id: 'article-1',
    slug: 'cannabis-basics',
    title: 'Cannabis Basics',
    content: 'Learn about cannabis...',
    publishedAt: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: false });
  });

  it('should fetch article by slug', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticle });

    const { result } = renderHook(() => useArticleBySlug('cannabis-basics'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticle);
    expect(cmsClient.get).toHaveBeenCalledWith('/content/articles/cannabis-basics', {
      headers: undefined,
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'cms:article:cannabis-basics',
      JSON.stringify(mockArticle)
    );
  });

  it('should fetch with preview header when in preview mode', async () => {
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: true });
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticle });

    const { result } = renderHook(() => useArticleBySlug('cannabis-basics'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith('/content/articles/cannabis-basics', {
      headers: { 'X-Preview': 'true' },
    });
  });

  it('should use cached article on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockArticle));

    const { result } = renderHook(() => useArticleBySlug('cannabis-basics'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticle);
  });

  it('should not fetch when slug is empty', () => {
    const { result } = renderHook(() => useArticleBySlug(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(cmsClient.get).not.toHaveBeenCalled();
  });
});
