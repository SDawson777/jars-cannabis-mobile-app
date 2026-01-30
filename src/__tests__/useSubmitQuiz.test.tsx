import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubmitQuiz } from '../hooks/useSubmitQuiz';
import { submitQuiz } from '../api/quizClient';

jest.mock('../api/quizClient');

const mockedSubmitQuiz = submitQuiz as jest.MockedFunction<typeof submitQuiz>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSubmitQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit quiz answers successfully', async () => {
    const mockResponse = {
      passed: true,
      score: 80,
      correctCount: 4,
      totalQuestions: 5,
      pointsEarned: 50,
      message: 'Great job!',
    };
    mockedSubmitQuiz.mockResolvedValue(mockResponse);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useSubmitQuiz({ onSuccess }), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        quizId: 'quiz-1',
        answers: [{ questionId: 'q1', selectedOptionId: 'opt-1' }],
        articleSlug: 'cannabis-101',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(mockedSubmitQuiz).toHaveBeenCalledWith('quiz-1', [
      { questionId: 'q1', selectedOptionId: 'opt-1' },
    ]);
  });

  it('should handle submission errors', async () => {
    mockedSubmitQuiz.mockRejectedValue(new Error('Submission failed'));

    const onError = jest.fn();
    const { result } = renderHook(() => useSubmitQuiz({ onError }), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        quizId: 'quiz-1',
        answers: [{ questionId: 'q1', selectedOptionId: 'opt-1' }],
        articleSlug: 'cannabis-101',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Submission failed');
    expect(onError).toHaveBeenCalled();
  });

  it('should work without options', async () => {
    const mockResponse = {
      passed: true,
      score: 100,
      correctCount: 10,
      totalQuestions: 10,
      pointsEarned: 100,
    };
    mockedSubmitQuiz.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        quizId: 'quiz-2',
        answers: [],
        articleSlug: 'test-article',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
  });
});
