// backend/src/routes/quizzes.ts
// Quiz routes for article quizzes → loyalty points feature

import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const quizzesRouter = Router();

// Use prisma as any for flexibility with schema changes
const p = prisma as any;

/**
 * Helper to calculate user's quiz status
 */
async function getUserQuizStatus(quizId: string, userId: string) {
  if (!p.quizAttempt) return null;

  const attempts = await p.quizAttempt.findMany({
    where: { quizId, userId },
    orderBy: { createdAt: 'desc' },
  });

  const quiz = p.quiz ? await p.quiz.findUnique({ where: { id: quizId } }) : null;
  if (!quiz) return null;

  const attemptCount = attempts.length;
  const passed = attempts.some((a: any) => a.passed);
  const rewarded = attempts.some((a: any) => a.pointsEarned > 0);
  const lastAttempt = attempts[0];
  const passedAttempt = attempts.find((a: any) => a.passed);

  // Calculate remaining attempts
  let remainingAttempts: number | null = null;
  if (quiz.maxAttempts !== null) {
    remainingAttempts = Math.max(0, quiz.maxAttempts - attemptCount);
  }

  // Locked if passed or max attempts reached
  const locked = passed || (quiz.maxAttempts !== null && attemptCount >= quiz.maxAttempts);

  return {
    attemptCount,
    passed,
    locked,
    rewarded,
    remainingAttempts,
    lastScore: lastAttempt?.score ?? null,
    passedAt: passedAttempt?.createdAt?.toISOString() ?? undefined,
    pointsEarned: passedAttempt?.pointsEarned ?? undefined,
  };
}

/**
 * Helper to transform quiz to API response format
 */
function transformQuiz(quiz: any) {
  return {
    _id: quiz.id,
    title: quiz.title,
    pointsReward: quiz.pointsReward,
    passThreshold: quiz.passThreshold,
    maxAttempts: quiz.maxAttempts,
    randomizeQuestions: quiz.randomizeQuestions,
    randomizeOptions: quiz.randomizeOptions,
    questions: (quiz.questions || []).map((q: any) => ({
      _key: q.id,
      prompt: q.prompt,
      options: q.options,
      explanation: q.explanation,
    })),
  };
}

/**
 * GET /content/articles/:slug/quiz
 * Fetch quiz for an article by slug
 */
quizzesRouter.get('/content/articles/:slug/quiz', async (req, res) => {
  const { slug } = req.params;
  const userId = (req as any).user?.userId;

  try {
    // Check if article model exists
    if (!p.article) {
      return res.json({ quiz: null, userStatus: null });
    }

    // Find article by slug with quiz if quiz model exists
    let article: any = null;
    if (p.quiz) {
      article = await p.article.findUnique({
        where: { slug },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      });
    } else {
      article = await p.article.findUnique({ where: { slug } });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!article.quiz || !article.quiz.isActive) {
      return res.json({ quiz: null, userStatus: null });
    }

    const quiz = transformQuiz(article.quiz);

    // Get user status if authenticated
    let userStatus = null;
    if (userId) {
      userStatus = await getUserQuizStatus(article.quiz.id, userId);
    }

    return res.json({ quiz, userStatus });
  } catch (error) {
    console.error('Error fetching quiz for article:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

/**
 * POST /quizzes/:quizId/submit
 * Submit quiz answers
 */
quizzesRouter.post('/quizzes/:quizId/submit', requireAuth, async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const userId = (req as any).user.userId;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array of indices' });
  }

  // Check if quiz model exists
  if (!p.quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  try {
    // Get quiz with questions
    const quiz = await p.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user has already passed or exhausted attempts
    const existingStatus = await getUserQuizStatus(quizId, userId);
    if (existingStatus?.locked) {
      return res.status(400).json({
        error: existingStatus.passed
          ? 'You have already passed this quiz'
          : 'Maximum attempts reached',
        locked: true,
      });
    }

    // Validate answers length
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        error: `Expected ${quiz.questions.length} answers, got ${answers.length}`,
      });
    }

    // Score the quiz
    let correctCount = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      if (userAnswer === question.correctIndex) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passThreshold;

    // Award points only on first pass
    let pointsAwarded = 0;
    if (passed && !existingStatus?.rewarded) {
      pointsAwarded = quiz.pointsReward;

      // Update user's loyalty points
      await prisma.loyaltyStatus.upsert({
        where: { userId },
        create: { userId, points: pointsAwarded, tier: 'Bronze' },
        update: { points: { increment: pointsAwarded } },
      });
    }

    // Record the attempt
    if (p.quizAttempt) {
      await p.quizAttempt.create({
        data: {
          quizId,
          userId,
          answers,
          score,
          passed,
          pointsEarned: pointsAwarded,
        },
      });
    }

    // Get updated status
    const newStatus = await getUserQuizStatus(quizId, userId);

    return res.json({
      passed,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      pointsAwarded,
      message: passed
        ? pointsAwarded > 0
          ? `Congratulations! You earned ${pointsAwarded} points!`
          : 'Great job! You passed!'
        : `You scored ${score}%. Need ${quiz.passThreshold}% to pass.`,
      locked: newStatus?.locked ?? false,
      remainingAttempts: newStatus?.remainingAttempts,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

/**
 * GET /quizzes/:quizId/status
 * Get user's quiz status
 */
quizzesRouter.get('/quizzes/:quizId/status', requireAuth, async (req, res) => {
  const { quizId } = req.params;
  const userId = (req as any).user.userId;

  // Check if quiz model exists
  if (!p.quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  try {
    const quiz = await p.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const status = await getUserQuizStatus(quizId, userId);
    return res.json(status);
  } catch (error) {
    console.error('Error fetching quiz status:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz status' });
  }
});
