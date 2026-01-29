import { renderHook, waitFor } from '@testing-library/react-native';
import { useQuizStore } from '../store/quizStore';
import * as quizService from '../services/quizService';

jest.mock('../services/quizService', () => ({
  quizService: {
    getQuizForArticle: jest.fn(),
    submitQuizAnswers: jest.fn(),
    submitQuiz: jest.fn(),
  },
  shuffleArray: jest.fn(arr => arr),
}));

describe('useQuizStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuizStore.setState({
      currentQuiz: null,
      userStatus: null,
      answers: [],
      currentQuestionIndex: 0,
      isSubmitting: false,
      isLoading: false,
      result: null,
    });
  });

  it('should load quiz for article', async () => {
    const mockQuiz = {
      id: 'quiz-1',
      articleSlug: 'test-article',
      questions: [{ id: 'q1', text: 'Question 1', options: ['A', 'B', 'C'] }],
      randomizeQuestions: false,
      randomizeOptions: false,
    };
    (quizService.quizService.getQuizForArticle as jest.Mock).mockResolvedValue({
      quiz: mockQuiz,
      userStatus: { completed: false },
    });

    const { result } = renderHook(() => useQuizStore());

    await result.current.loadQuizForArticle('test-article');

    await waitFor(() => {
      expect(result.current.currentQuiz).toEqual(mockQuiz);
    });
  });

  it('should set answer', async () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({ answers: [null, null, null] });

    result.current.setAnswer(0, 1);

    await waitFor(() => {
      expect(result.current.answers[0]).toBe(1);
    });
  });

  it('should navigate to next question', async () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({
      currentQuestionIndex: 0,
      currentQuiz: {
        id: 'quiz-1',
        questions: [{}, {}] as any,
      } as any,
    });

    result.current.nextQuestion();

    await waitFor(() => {
      expect(result.current.currentQuestionIndex).toBe(1);
    });
  });

  it('should navigate to previous question', async () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({ currentQuestionIndex: 2 });

    result.current.prevQuestion();

    await waitFor(() => {
      expect(result.current.currentQuestionIndex).toBe(1);
    });
  });

  it('should go to specific question', async () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({
      currentQuiz: {
        id: 'quiz-1',
        questions: Array(10).fill({}) as any,
      } as any,
    });

    result.current.goToQuestion(5);

    await waitFor(() => {
      expect(result.current.currentQuestionIndex).toBe(5);
    });
  });

  it('should reset quiz', () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({
      currentQuestionIndex: 5,
      answers: [1, 2, 3],
      result: { score: 80 } as any,
    });

    result.current.resetQuiz();

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it('should clear quiz', () => {
    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({
      currentQuiz: { id: 'quiz-1' } as any,
      answers: [1, 2, 3],
    });

    result.current.clearQuiz();

    expect(result.current.currentQuiz).toBeNull();
  });

  it('should submit quiz', async () => {
    const mockResult = {
      score: 90,
      correct: 9,
      total: 10,
      passed: true,
      locked: false,
      pointsAwarded: 10,
    };
    (quizService.quizService.submitQuiz as jest.Mock).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useQuizStore());
    useQuizStore.setState({
      currentQuiz: { _id: 'quiz-1', articleSlug: 'test', id: 'quiz-1', questions: [] } as any,
      answers: [1, 2, 3],
      userStatus: { completed: false, attemptCount: 0 } as any,
    });

    await result.current.submitQuiz();

    await waitFor(() => {
      expect(result.current.result).toEqual(mockResult);
    });
  });
});
