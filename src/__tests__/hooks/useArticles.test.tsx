import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useArticlesQuery } from '../../hooks/useArticles';
import * as useCMSContentModule from '../../hooks/useCMSContent';

jest.mock('../../hooks/useCMSContent', () => ({
  useCMSContent: jest.fn(),
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

describe('useArticlesQuery hook', () => {
  const mockArticles = [
    {
      id: 'article-1',
      slug: 'cannabis-basics',
      title: 'Cannabis Basics',
      content: 'Introduction to cannabis...',
      publishedAt: '2024-01-15',
    },
    {
      id: 'article-2',
      slug: 'strain-guide',
      title: 'Complete Strain Guide',
      content: 'Learn about different strains...',
      publishedAt: '2024-01-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useCMSContent with correct parameters', () => {
    const mockReturn = {
      data: mockArticles,
      isLoading: false,
      isError: false,
      error: null,
    };
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue(mockReturn);

    const { result } = renderHook(() => useArticlesQuery(), { wrapper: createWrapper() });

    expect(useCMSContentModule.useCMSContent).toHaveBeenCalledWith(
      ['articles'],
      '/content/articles'
    );
    expect(result.current.data).toEqual(mockArticles);
  });

  it('should return loading state', () => {
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useArticlesQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return error state', () => {
    const mockError = new Error('Failed to fetch articles');
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    });

    const { result } = renderHook(() => useArticlesQuery(), { wrapper: createWrapper() });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(mockError);
  });
});
