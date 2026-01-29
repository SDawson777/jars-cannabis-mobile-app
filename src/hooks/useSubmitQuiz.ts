// src/hooks/useSubmitQuiz.ts
// React Query mutation for submitting quiz answers

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitQuiz } from '../api/quizClient';
import type { QuizAnswer, QuizSubmitResponse } from '../types/quiz';
import { ARTICLE_QUIZ_QUERY_KEY } from './useArticleQuiz';

interface SubmitQuizParams {
  quizId: string;
  answers: QuizAnswer[];
  articleSlug: string;
}

interface UseSubmitQuizOptions {
  onSuccess?: (data: QuizSubmitResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Mutation hook for submitting quiz answers
 * Invalidates quiz status and loyalty queries on success
 */
export function useSubmitQuiz(options?: UseSubmitQuizOptions) {
  const queryClient = useQueryClient();

  return useMutation<QuizSubmitResponse, Error, SubmitQuizParams>({
    mutationFn: ({ quizId, answers }: SubmitQuizParams) => submitQuiz(quizId, answers),
    onSuccess: (data: QuizSubmitResponse, variables: SubmitQuizParams) => {
      // Invalidate quiz query to refresh user status
      queryClient.invalidateQueries({
        queryKey: [ARTICLE_QUIZ_QUERY_KEY, variables.articleSlug],
      });

      // Invalidate loyalty/wallet queries to reflect new points
      queryClient.invalidateQueries({ queryKey: ['loyaltyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
