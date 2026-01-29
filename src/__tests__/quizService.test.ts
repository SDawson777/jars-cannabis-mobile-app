import { quizService, shuffleArray } from '../services/quizService';
import api from '../api/http';

jest.mock('../api/http', () => ({
  get: jest.fn(),
  post: jest.fn(),
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('quizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizForArticle', () => {
    it('should fetch quiz for an article', async () => {
      const mockResponse = {
        quiz: { _id: 'quiz-1', title: 'Test Quiz', questions: [] },
        userStatus: { attemptCount: 0, passed: false, locked: false },
      };
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await quizService.getQuizForArticle('cannabis-101');

      expect(result).toEqual(mockResponse);
      expect(mockedApi.get).toHaveBeenCalledWith('/content/articles/cannabis-101/quiz');
    });

    it('should return null quiz on 404', async () => {
      const error = { response: { status: 404 } };
      (mockedApi.get as jest.Mock).mockRejectedValue(error);

      const result = await quizService.getQuizForArticle('non-existent');

      expect(result).toEqual({ quiz: null, userStatus: null });
    });

    it('should throw on other errors', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('Server error'));

      await expect(quizService.getQuizForArticle('bad-article')).rejects.toThrow('Server error');
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz answers', async () => {
      const mockResult = {
        passed: true,
        score: 80,
        correctCount: 4,
        totalQuestions: 5,
        pointsAwarded: 50,
        message: 'Great job!',
        locked: false,
      };
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: mockResult });

      const result = await quizService.submitQuiz('quiz-1', [0, 2, 1, 3]);

      expect(result).toEqual(mockResult);
      expect(mockedApi.post).toHaveBeenCalledWith('/quizzes/quiz-1/submit', {
        answers: [0, 2, 1, 3],
      });
    });

    it('should handle submission errors', async () => {
      (mockedApi.post as jest.Mock).mockRejectedValue(new Error('Submit failed'));

      await expect(quizService.submitQuiz('quiz-1', [])).rejects.toThrow('Submit failed');
    });
  });

  describe('getQuizStatus', () => {
    it('should fetch quiz status', async () => {
      const mockStatus = {
        attemptCount: 2,
        passed: true,
        locked: false,
        rewarded: true,
        remainingAttempts: null,
        lastScore: 100,
      };
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockStatus });

      const result = await quizService.getQuizStatus('quiz-1');

      expect(result).toEqual(mockStatus);
      expect(mockedApi.get).toHaveBeenCalledWith('/quizzes/quiz-1/status');
    });
  });
});

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);

    expect(shuffled.length).toBe(original.length);
  });

  it('should contain all original elements', () => {
    const original = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleArray(original);

    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should not mutate the original array', () => {
    const original = [1, 2, 3];
    const copy = [...original];
    shuffleArray(original);

    expect(original).toEqual(copy);
  });

  it('should handle empty arrays', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should handle single element arrays', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });
});
