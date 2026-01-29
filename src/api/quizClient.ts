// src/api/quizClient.ts
// API client for quiz endpoints

import { cmsClient } from './cmsClient';
import type { Quiz, QuizAnswer, QuizSubmitResponse } from '../types/quiz';

/**
 * Get quiz for a specific article by slug
 * GET /api/v1/content/articles/:slug/quiz
 */
export async function getQuizForArticle(slug: string): Promise<Quiz | null> {
  try {
    const res = await cmsClient.get<{ quiz: Quiz | null }>(`/api/v1/content/articles/${slug}/quiz`);
    return res.data.quiz;
  } catch (error: any) {
    // 404 means no quiz available for this article
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Submit quiz answers
 * POST /api/v1/quizzes/:quizId/submit
 */
export async function submitQuiz(
  quizId: string,
  answers: QuizAnswer[]
): Promise<QuizSubmitResponse> {
  const res = await cmsClient.post<QuizSubmitResponse>(`/api/v1/quizzes/${quizId}/submit`, {
    answers,
  });
  return res.data;
}
