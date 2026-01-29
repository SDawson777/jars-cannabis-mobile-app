import { getQuizForArticle, submitQuiz } from '../api/quizClient';
import { cmsClient } from '../api/cmsClient';

jest.mock('../api/cmsClient');

const mockedCmsClient = cmsClient as jest.Mocked<typeof cmsClient>;

describe('quizClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizForArticle', () => {
    it('should fetch quiz for an article', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Cannabis 101 Quiz',
        questions: [{ id: 'q1', question: 'What is THC?', options: ['A', 'B', 'C', 'D'] }],
      };
      mockedCmsClient.get.mockResolvedValue({ data: { quiz: mockQuiz } });

      const result = await getQuizForArticle('cannabis-101');

      expect(result).toEqual(mockQuiz);
      expect(mockedCmsClient.get).toHaveBeenCalledWith(
        '/api/v1/content/articles/cannabis-101/quiz'
      );
    });

    it('should return null when no quiz is available', async () => {
      mockedCmsClient.get.mockResolvedValue({ data: { quiz: null } });

      const result = await getQuizForArticle('article-without-quiz');

      expect(result).toBeNull();
    });

    it('should return null on 404 error', async () => {
      const error = { response: { status: 404 } };
      mockedCmsClient.get.mockRejectedValue(error);

      const result = await getQuizForArticle('non-existent-article');

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      const error = new Error('Server error');
      mockedCmsClient.get.mockRejectedValue(error);

      await expect(getQuizForArticle('bad-article')).rejects.toThrow('Server error');
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz answers', async () => {
      const mockResponse = {
        passed: true,
        score: 80,
        pointsEarned: 50,
        correctAnswers: 4,
        totalQuestions: 5,
      };
      mockedCmsClient.post.mockResolvedValue({ data: mockResponse });

      const answers = [
        { questionId: 'q1', selectedOption: 0 },
        { questionId: 'q2', selectedOption: 2 },
      ];

      const result = await submitQuiz('quiz-1', answers);

      expect(result).toEqual(mockResponse);
      expect(mockedCmsClient.post).toHaveBeenCalledWith('/api/v1/quizzes/quiz-1/submit', {
        answers,
      });
    });

    it('should handle submission errors', async () => {
      mockedCmsClient.post.mockRejectedValue(new Error('Submission failed'));

      await expect(submitQuiz('quiz-1', [])).rejects.toThrow('Submission failed');
    });

    it('should submit empty answers array', async () => {
      mockedCmsClient.post.mockResolvedValue({ data: { passed: false, score: 0 } });

      const result = await submitQuiz('quiz-2', []);

      expect(result.passed).toBe(false);
      expect(mockedCmsClient.post).toHaveBeenCalledWith('/api/v1/quizzes/quiz-2/submit', {
        answers: [],
      });
    });
  });
});
