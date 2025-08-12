import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const journalRouter = Router();

journalRouter.get('/journal/entries', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const page = parseInt((req.query.page as string) || '1');
  const limit = Math.min(100, parseInt((req.query.limit as string) || '24'));
  const items = await prisma.journalEntry.findMany({
    where: { userId: uid },
    orderBy: { createdAt: 'desc' },
    take: limit, skip: (page - 1) * limit
  });
  res.json({ items });
});

journalRouter.post('/journal/entries', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { productId, rating, tags = [], note } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId required' });
  const entry = await prisma.journalEntry.create({ data: { userId: uid, productId, rating, notes: note, tags } });
  res.status(201).json(entry);
});

journalRouter.put('/journal/entries/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { rating, tags, note } = req.body || {};
  const existing = await prisma.journalEntry.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });
  const entry = await prisma.journalEntry.update({ where: { id: req.params.id }, data: { rating, tags, notes: note } });
  res.json(entry);
});
