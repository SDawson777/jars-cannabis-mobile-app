import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';

export const addressesRouter = Router();

addressesRouter.get('/addresses', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const p = prisma as any;
  const addrs = await p.address.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
  // normalize response shape
  const out = addrs.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    zipCode: a.zipCode,
    country: a.country,
    isDefault: !!a.isDefault,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
  return res.json(out);
});

addressesRouter.post('/addresses', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const p = prisma as any;
  const { line1, line2, city, state, zipCode, country, fullName, phone, isDefault } = req.body || {};
  // simple runtime validation
  if (!fullName || typeof fullName !== 'string' || !phone || typeof phone !== 'string' || !line1 || typeof line1 !== 'string' || !city || typeof city !== 'string' || !state || typeof state !== 'string' || !zipCode || typeof zipCode !== 'string' || !country || typeof country !== 'string') {
    return res.status(400).json({ error: 'Invalid address payload' });
  }
  const created = await p.address.create({
    data: {
      userId: uid,
      line1,
      line2: line2 || null,
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
  const out = {
    id: created.id,
    fullName: created.fullName,
    phone: created.phone,
    line1: created.line1,
    line2: created.line2,
    city: created.city,
    state: created.state,
    zipCode: created.zipCode,
    country: created.country,
    isDefault: !!created.isDefault,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
  return res.status(201).json(out);
});

addressesRouter.put('/addresses/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const id = req.params.id;
  const p = prisma as any;
  const existing = await p.address.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });
  const { line1, line2, city, state, zipCode, country, fullName, phone, isDefault } = req.body || {};
  // optional type checks
  if (fullName !== undefined && typeof fullName !== 'string') return res.status(400).json({ error: 'Invalid fullName' });
  if (phone !== undefined && typeof phone !== 'string') return res.status(400).json({ error: 'Invalid phone' });
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
  const out = {
    id: updated.id,
    fullName: updated.fullName,
    phone: updated.phone,
    line1: updated.line1,
    line2: updated.line2,
    city: updated.city,
    state: updated.state,
    zipCode: updated.zipCode,
    country: updated.country,
    isDefault: !!updated.isDefault,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
  return res.json(out);
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
