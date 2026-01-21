import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useEducationalArticles } from '../../hooks/useEducationalArticles';
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

describe('useEducationalArticles hook', () => {
  const mockArticles = [
    { __id: 'article-1', title: 'Cannabis Basics', slug: 'cannabis-basics' },
    { __id: 'article-2', title: 'Strain Guide', slug: 'strain-guide' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: false });
  });

  it('should fetch articles when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticles });

    const { result } = renderHook(() => useEducationalArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticles);
    expect(cmsClient.get).toHaveBeenCalledWith('/content/articles', expect.anything());
  });

  it('should cache fetched articles', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticles });

    const { result } = renderHook(() => useEducationalArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should use cache when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockArticles));

    const { result } = renderHook(() => useEducationalArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticles);
    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should fetch with query params', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticles });

    const { result } = renderHook(
      () => useEducationalArticles({ page: 1, limit: 10, tag: 'education' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.anything()
    );
  });

  it('should fetch with preview header in preview mode', async () => {
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: true });
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockArticles });

    const { result } = renderHook(() => useEducationalArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ headers: { 'X-Preview': 'true' } })
    );
  });

  it('should fallback to cache on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockArticles));

    const { result } = renderHook(() => useEducationalArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticles);
  });
});
