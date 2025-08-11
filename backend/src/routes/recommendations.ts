import { Router } from 'express';
import { authOptional } from '../util/auth';
import { forYou, relatedTo } from '../modules/recommendations/service';

export const recommendationsRouter = Router();

recommendationsRouter.get('/recommendations/for-you', authOptional, async (req, res) => {
  const userId = (req as any).user?.id;
  const storeId = (req.query.storeId as string) || undefined;
  const data = await forYou(userId, storeId);
  res.json({ items: data });
});

recommendationsRouter.get('/recommendations/related/:productId', async (req, res) => {
  const storeId = (req.query.storeId as string) || undefined;
  const data = await relatedTo(req.params.productId, storeId);
  res.json({ items: data });
});
