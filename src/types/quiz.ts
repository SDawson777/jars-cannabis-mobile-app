// src/types/quiz.ts
// Quiz types for article quizzes → loyalty points feature

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  articleSlug: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  pointsReward: number;
  passThreshold: number; // percentage (0-100) needed to pass
  endAt?: string; // ISO date string, undefined = no expiry
  maxAttempts?: number; // undefined = unlimited
  userStatus?: QuizUserStatus;
}

export interface QuizUserStatus {
  passed: boolean;
  attempts: number;
  lastAttemptAt?: string;
  pointsEarned?: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface QuizSubmitResponse {
  passed: boolean;
  score: number; // percentage 0-100
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  remainingAttempts?: number;
  message?: string;
}
