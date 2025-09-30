import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

// Address validation schema: all create fields required except line2.
const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .transform(p => p.replace(/[^+\d]/g, '')),
  line1: z.string().trim().min(1).max(100),
  line2: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(2).max(2),
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, 'zipCode must be 12345 or 12345-6789'),
  country: z.string().trim().min(2).max(2),
  isDefault: z.boolean().optional(),
});

export const addressesRouter = Router();

addressesRouter.get('/addresses', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const p = prisma as any;
  const addrs = await p.address.findMany({
    where: { userId: uid },
    orderBy: { createdAt: 'desc' },
  });
  // normalize response shape
  const out = addrs.map(a => ({
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
  const parse = addressSchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid_payload', details: parse.error.flatten() });
  }
  const { fullName, phone, line1, line2, city, state, zipCode, country, isDefault } = parse.data;

  // Duplicate detection (userId + line1 + city + state + zipCode [case-insensitive])
  const existing = await p.address.findMany({ where: { userId: uid } });
  const dup = existing.find(
    (a: any) =>
      a.line1.toLowerCase() === line1.toLowerCase() &&
      a.city.toLowerCase() === city.toLowerCase() &&
      a.state.toLowerCase() === state.toLowerCase() &&
      a.zipCode.toLowerCase() === zipCode.toLowerCase()
  );
  if (dup) return res.status(409).json({ error: 'duplicate_address' });

  const created = await p.address.create({
    data: {
      userId: uid,
      line1,
      line2: line2 ? line2 : null,
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
    await p.address.updateMany({
      where: { userId: uid, id: { not: created.id } },
      data: { isDefault: false },
    });
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

  const partialSchema = addressSchema.partial();
  const parse = partialSchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid_payload', details: parse.error.flatten() });
  }
  const { fullName, phone, line1, line2, city, state, zipCode, country, isDefault } = parse.data;

  // If identifying location components change, check duplicates
  if (line1 || city || state || zipCode) {
    const others = await p.address.findMany({ where: { userId: uid } });
    const dup = others.find(
      (a: any) =>
        a.id !== id &&
        (line1 ?? existing.line1).toLowerCase() === a.line1.toLowerCase() &&
        (city ?? existing.city).toLowerCase() === a.city.toLowerCase() &&
        (state ?? existing.state).toLowerCase() === a.state.toLowerCase() &&
        (zipCode ?? existing.zipCode).toLowerCase() === a.zipCode.toLowerCase()
    );
    if (dup) return res.status(409).json({ error: 'duplicate_address' });
  }

  const updated = await p.address.update({
    where: { id },
    data: {
      ...(line1 !== undefined ? { line1 } : {}),
      ...(line2 !== undefined ? { line2: line2 || null } : {}),
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
    await p.address.updateMany({
      where: { userId: uid, id: { not: updated.id } },
      data: { isDefault: false },
    });
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
