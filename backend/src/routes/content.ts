import { Router } from 'express';
import { prisma } from '../prismaClient';

export const contentRouter = Router();

contentRouter.get('/content/faq', async (req, res) => {
  const locale = (req.query.locale as string) || 'en-US';
  const pages = await prisma.contentPage.findMany({
    where: { type: 'faq', locale, published: true },
  });
  res.json({ items: pages });
});

contentRouter.get('/content/legal', async (req, res) => {
  const locale = (req.query.locale as string) || 'en-US';
  const pages = await prisma.contentPage.findMany({
    where: { type: 'legal', locale, published: true },
  });
  res.json({ items: pages });
});
