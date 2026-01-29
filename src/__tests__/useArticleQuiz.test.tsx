import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArticleQuiz } from '../hooks/useArticleQuiz';
import { getQuizForArticle } from '../api/quizClient';

jest.mock('../api/quizClient');

const mockedGetQuizForArticle = getQuizForArticle as jest.MockedFunction<typeof getQuizForArticle>;

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

describe('useArticleQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch quiz for a valid article slug', async () => {
    const mockQuiz = {
      id: 'quiz-1',
      title: 'Cannabis 101 Quiz',
      questions: [{ id: 'q1', question: 'What is THC?', options: ['Option A', 'Option B'] }],
    };
    mockedGetQuizForArticle.mockResolvedValue(mockQuiz);

    const { result } = renderHook(() => useArticleQuiz('cannabis-101'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockQuiz);
    expect(mockedGetQuizForArticle).toHaveBeenCalledWith('cannabis-101');
  });

  it('should not fetch when slug is empty', async () => {
    const { result } = renderHook(() => useArticleQuiz(''), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockedGetQuizForArticle).not.toHaveBeenCalled();
  });

  it('should return null when no quiz is available', async () => {
    mockedGetQuizForArticle.mockResolvedValue(null);

    const { result } = renderHook(() => useArticleQuiz('article-without-quiz'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('should handle API errors', async () => {
    mockedGetQuizForArticle.mockRejectedValue(new Error('Quiz not found'));

    const { result } = renderHook(() => useArticleQuiz('invalid-slug'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Quiz not found');
  });
});
