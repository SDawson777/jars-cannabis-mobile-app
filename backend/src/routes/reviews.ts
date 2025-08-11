import { Router } from 'express';
import { authRequired } from '../util/auth';
import { prisma } from '../prismaClient';

export const reviewsRouter = Router();

reviewsRouter.get('/:id/reviews', async (req, res) => {
  const items = await prisma.review.findMany({
    where: { productId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items });
});

reviewsRouter.post('/:id/reviews', authRequired, async (req, res) => {
  const { rating, text } = req.body as { rating: number; text?: string };
  if (!rating) return res.status(400).json({ error: 'rating required' });
  const review = await prisma.review.create({
    data: {
      productId: req.params.id,
      userId: (req as any).user.id,
      rating,
      text,
    },
  });
  res.status(201).json(review);
});
