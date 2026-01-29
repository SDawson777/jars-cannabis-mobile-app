// src/hooks/useArticleQuiz.ts
// React Query hook for fetching quiz associated with an article

import { useQuery } from '@tanstack/react-query';

import { getQuizForArticle } from '../api/quizClient';
import type { Quiz } from '../types/quiz';

export const ARTICLE_QUIZ_QUERY_KEY = 'articleQuiz';

/**
 * Fetch quiz for a given article slug
 * Returns null if no quiz is available
 */
export function useArticleQuiz(slug: string) {
  return useQuery<Quiz | null, Error>({
    queryKey: [ARTICLE_QUIZ_QUERY_KEY, slug],
    queryFn: () => getQuizForArticle(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!slug,
  });
}
