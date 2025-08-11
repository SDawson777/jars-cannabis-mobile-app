import { Router } from 'express';
import { authRequired } from '../util/auth';
import { prisma } from '../prismaClient';

export const journalRouter = Router();

journalRouter.get('/journal/entries', authRequired, async (req, res) => {
  const items = await prisma.journalEntry.findMany({
    where: { userId: (req as any).user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items });
});

journalRouter.post('/journal/entries', authRequired, async (req, res) => {
  const { productId, rating, notes, tags = [] } = req.body as any;
  const created = await prisma.journalEntry.create({
    data: { userId: (req as any).user.id, productId, rating, notes, tags },
  });
  await prisma.userEvent.create({
    data: { userId: (req as any).user.id, type: 'journal', productId, tags },
  });
  res.status(201).json(created);
});

journalRouter.put('/journal/entries/:id', authRequired, async (req, res) => {
  const updated = await prisma.journalEntry.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});
