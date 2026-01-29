import type {
  QuizQuestion,
  QuizOption,
  Quiz,
  QuizUserStatus,
  QuizSubmission,
  QuizAnswer,
  QuizSubmitResponse,
} from '../types/quiz';

describe('quiz types', () => {
  describe('QuizOption', () => {
    it('has correct structure with id and text', () => {
      const option: QuizOption = {
        id: 'opt-1',
        text: 'Option A',
      };

      expect(option.id).toBe('opt-1');
      expect(option.text).toBe('Option A');
    });

    it('accepts various text content', () => {
      const option: QuizOption = {
        id: 'opt-2',
        text: 'This is a longer option text with multiple words',
      };

      expect(option.text).toContain('longer option');
    });
  });

  describe('QuizQuestion', () => {
    it('has correct structure with id, text, and options', () => {
      const question: QuizQuestion = {
        id: 'q-1',
        text: 'What is THC?',
        options: [
          { id: 'a', text: 'Tetrahydrocannabinol' },
          { id: 'b', text: 'Tetrahydrocannabidiol' },
        ],
      };

      expect(question.id).toBe('q-1');
      expect(question.text).toBe('What is THC?');
      expect(question.options).toHaveLength(2);
    });

    it('accepts multiple options', () => {
      const question: QuizQuestion = {
        id: 'q-2',
        text: 'Test question',
        options: [
          { id: 'opt-1', text: 'A' },
          { id: 'opt-2', text: 'B' },
          { id: 'opt-3', text: 'C' },
          { id: 'opt-4', text: 'D' },
        ],
      };

      expect(question.options).toHaveLength(4);
    });

    it('accepts empty options array', () => {
      const question: QuizQuestion = {
        id: 'q-3',
        text: 'Question without options',
        options: [],
      };

      expect(question.options).toEqual([]);
    });
  });

  describe('QuizUserStatus', () => {
    it('has correct structure for passed status', () => {
      const status: QuizUserStatus = {
        passed: true,
        attempts: 1,
        lastAttemptAt: '2026-01-23T10:00:00Z',
        pointsEarned: 100,
      };

      expect(status.passed).toBe(true);
      expect(status.attempts).toBe(1);
      expect(status.lastAttemptAt).toBe('2026-01-23T10:00:00Z');
      expect(status.pointsEarned).toBe(100);
    });

    it('has correct structure for failed status', () => {
      const status: QuizUserStatus = {
        passed: false,
        attempts: 2,
      };

      expect(status.passed).toBe(false);
      expect(status.attempts).toBe(2);
      expect(status.lastAttemptAt).toBeUndefined();
      expect(status.pointsEarned).toBeUndefined();
    });

    it('accepts optional lastAttemptAt', () => {
      const withDate: QuizUserStatus = {
        passed: true,
        attempts: 1,
        lastAttemptAt: '2026-01-20T15:30:00Z',
      };

      const withoutDate: QuizUserStatus = {
        passed: false,
        attempts: 1,
      };

      expect(withDate.lastAttemptAt).toBeDefined();
      expect(withoutDate.lastAttemptAt).toBeUndefined();
    });

    it('accepts optional pointsEarned', () => {
      const withPoints: QuizUserStatus = {
        passed: true,
        attempts: 1,
        pointsEarned: 50,
      };

      const withoutPoints: QuizUserStatus = {
        passed: false,
        attempts: 1,
      };

      expect(withPoints.pointsEarned).toBe(50);
      expect(withoutPoints.pointsEarned).toBeUndefined();
    });
  });

  describe('Quiz', () => {
    it('has correct structure with all required fields', () => {
      const quiz: Quiz = {
        id: 'quiz-123',
        articleSlug: 'intro-to-cannabis',
        title: 'Introduction to Cannabis Quiz',
        questions: [],
        pointsReward: 100,
        passThreshold: 70,
      };

      expect(quiz.id).toBe('quiz-123');
      expect(quiz.articleSlug).toBe('intro-to-cannabis');
      expect(quiz.title).toBe('Introduction to Cannabis Quiz');
      expect(quiz.pointsReward).toBe(100);
      expect(quiz.passThreshold).toBe(70);
    });

    it('accepts optional description', () => {
      const withDescription: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test Quiz',
        description: 'This is a test quiz about cannabis',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
      };

      const withoutDescription: Quiz = {
        id: 'quiz-2',
        articleSlug: 'test',
        title: 'Test Quiz',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
      };

      expect(withDescription.description).toBe('This is a test quiz about cannabis');
      expect(withoutDescription.description).toBeUndefined();
    });

    it('accepts optional endAt date', () => {
      const withEndDate: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
        endAt: '2026-12-31T23:59:59Z',
      };

      const withoutEndDate: Quiz = {
        id: 'quiz-2',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
      };

      expect(withEndDate.endAt).toBe('2026-12-31T23:59:59Z');
      expect(withoutEndDate.endAt).toBeUndefined();
    });

    it('accepts optional maxAttempts', () => {
      const withMaxAttempts: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
        maxAttempts: 3,
      };

      const unlimitedAttempts: Quiz = {
        id: 'quiz-2',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
      };

      expect(withMaxAttempts.maxAttempts).toBe(3);
      expect(unlimitedAttempts.maxAttempts).toBeUndefined();
    });

    it('accepts optional userStatus', () => {
      const withStatus: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
        userStatus: {
          passed: true,
          attempts: 1,
          pointsEarned: 50,
        },
      };

      const withoutStatus: Quiz = {
        id: 'quiz-2',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 80,
      };

      expect(withStatus.userStatus).toBeDefined();
      expect(withStatus.userStatus?.passed).toBe(true);
      expect(withoutStatus.userStatus).toBeUndefined();
    });

    it('accepts questions array', () => {
      const quiz: Quiz = {
        id: 'quiz-1',
        articleSlug: 'cannabis-basics',
        title: 'Cannabis Basics',
        questions: [
          {
            id: 'q-1',
            text: 'What is CBD?',
            options: [
              { id: 'a', text: 'Cannabidiol' },
              { id: 'b', text: 'Cannabinoid' },
            ],
          },
          {
            id: 'q-2',
            text: 'What is THC?',
            options: [
              { id: 'a', text: 'Tetrahydrocannabinol' },
              { id: 'b', text: 'Tetrahydrocannabidiol' },
            ],
          },
        ],
        pointsReward: 100,
        passThreshold: 75,
      };

      expect(quiz.questions).toHaveLength(2);
      expect(quiz.questions[0].text).toBe('What is CBD?');
    });

    it('accepts passThreshold as percentage', () => {
      const quiz: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 85,
      };

      expect(quiz.passThreshold).toBeGreaterThanOrEqual(0);
      expect(quiz.passThreshold).toBeLessThanOrEqual(100);
    });
  });

  describe('QuizAnswer', () => {
    it('has correct structure with questionId and selectedOptionId', () => {
      const answer: QuizAnswer = {
        questionId: 'q-1',
        selectedOptionId: 'opt-a',
      };

      expect(answer.questionId).toBe('q-1');
      expect(answer.selectedOptionId).toBe('opt-a');
    });

    it('accepts various ID formats', () => {
      const answer: QuizAnswer = {
        questionId: 'question-123-abc',
        selectedOptionId: 'option-456-def',
      };

      expect(answer.questionId).toContain('123');
      expect(answer.selectedOptionId).toContain('456');
    });
  });

  describe('QuizSubmission', () => {
    it('has correct structure with quizId and answers', () => {
      const submission: QuizSubmission = {
        quizId: 'quiz-123',
        answers: [
          { questionId: 'q-1', selectedOptionId: 'opt-a' },
          { questionId: 'q-2', selectedOptionId: 'opt-b' },
        ],
      };

      expect(submission.quizId).toBe('quiz-123');
      expect(submission.answers).toHaveLength(2);
    });

    it('accepts empty answers array', () => {
      const submission: QuizSubmission = {
        quizId: 'quiz-456',
        answers: [],
      };

      expect(submission.answers).toEqual([]);
    });

    it('accepts multiple answers', () => {
      const submission: QuizSubmission = {
        quizId: 'quiz-789',
        answers: [
          { questionId: 'q-1', selectedOptionId: 'a' },
          { questionId: 'q-2', selectedOptionId: 'b' },
          { questionId: 'q-3', selectedOptionId: 'c' },
          { questionId: 'q-4', selectedOptionId: 'd' },
        ],
      };

      expect(submission.answers).toHaveLength(4);
    });
  });

  describe('QuizSubmitResponse', () => {
    it('has correct structure for passed result', () => {
      const response: QuizSubmitResponse = {
        passed: true,
        score: 85,
        correctCount: 17,
        totalQuestions: 20,
        pointsEarned: 100,
      };

      expect(response.passed).toBe(true);
      expect(response.score).toBe(85);
      expect(response.correctCount).toBe(17);
      expect(response.totalQuestions).toBe(20);
      expect(response.pointsEarned).toBe(100);
    });

    it('has correct structure for failed result', () => {
      const response: QuizSubmitResponse = {
        passed: false,
        score: 55,
        correctCount: 11,
        totalQuestions: 20,
        pointsEarned: 0,
      };

      expect(response.passed).toBe(false);
      expect(response.score).toBe(55);
      expect(response.pointsEarned).toBe(0);
    });

    it('accepts optional remainingAttempts', () => {
      const withAttempts: QuizSubmitResponse = {
        passed: false,
        score: 60,
        correctCount: 12,
        totalQuestions: 20,
        pointsEarned: 0,
        remainingAttempts: 2,
      };

      const withoutAttempts: QuizSubmitResponse = {
        passed: true,
        score: 90,
        correctCount: 18,
        totalQuestions: 20,
        pointsEarned: 100,
      };

      expect(withAttempts.remainingAttempts).toBe(2);
      expect(withoutAttempts.remainingAttempts).toBeUndefined();
    });

    it('accepts optional message', () => {
      const withMessage: QuizSubmitResponse = {
        passed: true,
        score: 100,
        correctCount: 20,
        totalQuestions: 20,
        pointsEarned: 100,
        message: 'Perfect score! Congratulations!',
      };

      const withoutMessage: QuizSubmitResponse = {
        passed: false,
        score: 50,
        correctCount: 10,
        totalQuestions: 20,
        pointsEarned: 0,
      };

      expect(withMessage.message).toBe('Perfect score! Congratulations!');
      expect(withoutMessage.message).toBeUndefined();
    });

    it('calculates correct score percentage', () => {
      const response: QuizSubmitResponse = {
        passed: true,
        score: 75,
        correctCount: 15,
        totalQuestions: 20,
        pointsEarned: 75,
      };

      expect(response.score).toBe((response.correctCount / response.totalQuestions) * 100);
    });

    it('accepts perfect score', () => {
      const response: QuizSubmitResponse = {
        passed: true,
        score: 100,
        correctCount: 10,
        totalQuestions: 10,
        pointsEarned: 100,
      };

      expect(response.score).toBe(100);
      expect(response.correctCount).toBe(response.totalQuestions);
    });

    it('accepts zero score', () => {
      const response: QuizSubmitResponse = {
        passed: false,
        score: 0,
        correctCount: 0,
        totalQuestions: 10,
        pointsEarned: 0,
      };

      expect(response.score).toBe(0);
      expect(response.correctCount).toBe(0);
    });
  });

  describe('type compatibility', () => {
    it('Quiz can contain QuizQuestions with QuizOptions', () => {
      const quiz: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test Quiz',
        questions: [
          {
            id: 'q-1',
            text: 'Question 1',
            options: [
              { id: 'a', text: 'Option A' },
              { id: 'b', text: 'Option B' },
            ],
          },
        ],
        pointsReward: 50,
        passThreshold: 70,
      };

      expect(quiz.questions[0].options[0].text).toBe('Option A');
    });

    it('Quiz can contain QuizUserStatus', () => {
      const quiz: Quiz = {
        id: 'quiz-1',
        articleSlug: 'test',
        title: 'Test',
        questions: [],
        pointsReward: 50,
        passThreshold: 70,
        userStatus: {
          passed: true,
          attempts: 1,
          lastAttemptAt: '2026-01-23T10:00:00Z',
          pointsEarned: 50,
        },
      };

      expect(quiz.userStatus?.passed).toBe(true);
    });

    it('QuizSubmission can contain QuizAnswers', () => {
      const submission: QuizSubmission = {
        quizId: 'quiz-1',
        answers: [
          { questionId: 'q-1', selectedOptionId: 'a' },
          { questionId: 'q-2', selectedOptionId: 'b' },
        ],
      };

      expect(submission.answers[0]).toHaveProperty('questionId');
      expect(submission.answers[0]).toHaveProperty('selectedOptionId');
    });
  });
});
