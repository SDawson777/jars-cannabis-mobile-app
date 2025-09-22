import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const addressesRouter = Router();

addressesRouter.get('/addresses', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const p = prisma as any;
  const addrs = await p.address.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
  return res.json(addrs);
});

addressesRouter.post('/addresses', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const { line1, line2, city, state, zipCode, country, fullName, phone, isDefault } = req.body || {};
  const p = prisma as any;
  const created = await p.address.create({
    data: {
      userId: uid,
      line1,
      line2,
      city,
      state,
      zipCode,
      country,
      fullName,
      phone,
      isDefault: !!isDefault,
    },
  });
  if (isDefault) {
    await p.address.updateMany({ where: { userId: uid, id: { not: created.id } }, data: { isDefault: false } });
  }
  return res.status(201).json(created);
});

addressesRouter.put('/addresses/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const id = req.params.id;
  const p = prisma as any;
  const existing = await p.address.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });
  const { line1, line2, city, state, zipCode, country, fullName, phone, isDefault } = req.body || {};
  const updated = await p.address.update({
    where: { id },
    data: {
      ...(line1 !== undefined ? { line1 } : {}),
      ...(line2 !== undefined ? { line2 } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(zipCode !== undefined ? { zipCode } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(fullName !== undefined ? { fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
    },
  });
  if (isDefault) {
    await p.address.updateMany({ where: { userId: uid, id: { not: updated.id } }, data: { isDefault: false } });
  }
  return res.json(updated);
});

addressesRouter.delete('/addresses/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const id = req.params.id;
  const p = prisma as any;
  const existing = await p.address.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });
  if (p.address.delete) {
    await p.address.delete({ where: { id } });
  } else if (p.address && typeof p.address._removeAddress === 'function') {
    p.address._removeAddress(id);
  }
  return res.json({ success: true });
});

export default addressesRouter;
