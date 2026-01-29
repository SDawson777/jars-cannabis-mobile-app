// src/services/quizService.ts
// Quiz API service layer for quiz endpoints

import api from '../api/http';

export interface QuizQuestion {
  _key: string;
  prompt: string;
  options: string[];
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  pointsReward: number;
  passThreshold: number;
  maxAttempts: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: QuizQuestion[];
}

export interface QuizUserStatus {
  attemptCount: number;
  passed: boolean;
  locked: boolean;
  rewarded: boolean;
  remainingAttempts: number | null;
  lastScore: number | null;
  passedAt?: string;
  pointsEarned?: number;
}

export interface QuizResponse {
  quiz: Quiz | null;
  userStatus: QuizUserStatus | null;
  error?: string;
}

export interface QuizSubmitResult {
  passed: boolean;
  score: number;
  correctCount: number;
  totalQuestions: number;
  pointsAwarded: number;
  message: string;
  locked: boolean;
  remainingAttempts?: number | null;
  error?: string;
}

export const quizService = {
  /**
   * Fetch quiz for an article by slug
   */
  async getQuizForArticle(articleSlug: string): Promise<QuizResponse> {
    try {
      const response = await api.get<QuizResponse>(`/content/articles/${articleSlug}/quiz`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return { quiz: null, userStatus: null };
      }
      throw error;
    }
  },

  /**
   * Submit quiz answers
   * @param quizId - The quiz ID
   * @param answers - Array of selected option indices
   */
  async submitQuiz(quizId: string, answers: number[]): Promise<QuizSubmitResult> {
    const response = await api.post<QuizSubmitResult>(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },

  /**
   * Get user's quiz status
   */
  async getQuizStatus(quizId: string): Promise<QuizUserStatus> {
    const response = await api.get<QuizUserStatus>(`/quizzes/${quizId}/status`);
    return response.data;
  },
};

// Export standalone functions for direct import
export const getQuizForArticle = quizService.getQuizForArticle;
export const submitQuiz = quizService.submitQuiz;
export const getQuizStatus = quizService.getQuizStatus;

/**
 * Helper function to shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
