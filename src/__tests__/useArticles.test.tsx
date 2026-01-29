import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useArticlesQuery } from '../hooks/useArticles';
import { useCMSContent } from '../hooks/useCMSContent';

jest.mock('../hooks/useCMSContent');

const mockUseCMSContent = useCMSContent as jest.MockedFunction<typeof useCMSContent>;

describe('useArticlesQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('calls useCMSContent with correct parameters', () => {
    mockUseCMSContent.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderHook(() => useArticlesQuery(), { wrapper });

    expect(mockUseCMSContent).toHaveBeenCalledWith(['articles'], '/content/articles');
  });

  it('returns query result from useCMSContent', () => {
    const mockArticles = [
      { uid: '1', title: 'Article 1', slug: 'article-1' },
      { uid: '2', title: 'Article 2', slug: 'article-2' },
    ];

    mockUseCMSContent.mockReturnValue({
      data: mockArticles,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useArticlesQuery(), { wrapper });

    expect(result.current.data).toEqual(mockArticles);
    expect(result.current.isSuccess).toBe(true);
  });

  it('handles loading state', () => {
    mockUseCMSContent.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useArticlesQuery(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', () => {
    const error = new Error('Failed to fetch');
    mockUseCMSContent.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    } as any);

    const { result } = renderHook(() => useArticlesQuery(), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
