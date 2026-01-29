// src/store/quizStore.ts
// Zustand store for quiz state management

import { create } from 'zustand';

import {
  Quiz,
  QuizUserStatus,
  QuizSubmitResult,
  quizService,
  shuffleArray,
} from '../services/quizService';

interface QuizState {
  // Current quiz being taken
  currentQuiz: Quiz | null;
  userStatus: QuizUserStatus | null;

  // Quiz-taking state
  answers: (number | null)[];
  currentQuestionIndex: number;
  isSubmitting: boolean;
  isLoading: boolean;

  // Results
  result: QuizSubmitResult | null;

  // Actions
  loadQuizForArticle: (articleSlug: string) => Promise<void>;
  setAnswer: (questionIndex: number, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => Promise<QuizSubmitResult | null>;
  resetQuiz: () => void;
  clearQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuiz: null,
  userStatus: null,
  answers: [],
  currentQuestionIndex: 0,
  isSubmitting: false,
  isLoading: false,
  result: null,

  loadQuizForArticle: async (articleSlug: string) => {
    set({ isLoading: true });
    try {
      const response = await quizService.getQuizForArticle(articleSlug);

      if (response.quiz) {
        // Optionally randomize questions on client if server sets randomizeQuestions
        let questions = [...response.quiz.questions];
        if (response.quiz.randomizeQuestions) {
          questions = shuffleArray(questions);
        }

        // Optionally randomize options
        if (response.quiz.randomizeOptions) {
          questions = questions.map(q => ({
            ...q,
            options: shuffleArray([...q.options]),
          }));
        }

        set({
          currentQuiz: { ...response.quiz, questions },
          userStatus: response.userStatus,
          answers: new Array(response.quiz.questions.length).fill(null),
          currentQuestionIndex: 0,
          result: null,
          isLoading: false,
        });
      } else {
        set({ currentQuiz: null, userStatus: null, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setAnswer: (questionIndex: number, optionIndex: number) => {
    const answers = [...get().answers];
    answers[questionIndex] = optionIndex;
    set({ answers });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentQuiz } = get();
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestion: (index: number) => {
    const { currentQuiz } = get();
    if (currentQuiz && index >= 0 && index < currentQuiz.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  submitQuiz: async () => {
    const { currentQuiz, answers } = get();
    if (!currentQuiz) return null;

    // Validate all questions answered
    if (answers.includes(null)) {
      return null;
    }

    set({ isSubmitting: true });

    try {
      const result = await quizService.submitQuiz(currentQuiz._id, answers as number[]);
      set({
        result,
        isSubmitting: false,
        userStatus: {
          ...get().userStatus!,
          attemptCount: (get().userStatus?.attemptCount || 0) + 1,
          passed: result.passed,
          locked: result.locked,
          rewarded: result.pointsAwarded > 0,
          lastScore: result.score,
        },
      });
      return result;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  resetQuiz: () => {
    const { currentQuiz } = get();
    if (currentQuiz) {
      set({
        answers: new Array(currentQuiz.questions.length).fill(null),
        currentQuestionIndex: 0,
        result: null,
      });
    }
  },

  clearQuiz: () => {
    set({
      currentQuiz: null,
      userStatus: null,
      answers: [],
      currentQuestionIndex: 0,
      isSubmitting: false,
      isLoading: false,
      result: null,
    });
  },
}));
