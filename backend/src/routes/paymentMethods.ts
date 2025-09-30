import { Router } from 'express';
import { prisma } from '../prismaClient';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

// Validation schema for creating/updating a payment method. We intentionally only
// persist non-sensitive metadata (brand, last4, expiry) – no PAN/CVV.
const baseSchema = z.object({
  cardBrand: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .transform(s => s.toLowerCase())
    .refine(b => ['visa', 'mastercard', 'amex', 'discover', 'other'].includes(b), {
      message: 'unsupported card brand',
    }),
  cardLast4: z
    .string()
    .trim()
    .regex(/^\d{4}$/i, 'cardLast4 must be 4 digits'),
  holderName: z.string().trim().max(70).optional(),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/i, 'expiry must be MM/YY')
    .optional(),
  isDefault: z.boolean().optional(),
});

export const paymentMethodsRouter = Router();

paymentMethodsRouter.get('/payment-methods', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const p = prisma as any;
  const methods = await p.paymentMethod.findMany({
    where: { userId: uid },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(methods);
});

paymentMethodsRouter.post('/payment-methods', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const parse = baseSchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid_payload', details: parse.error.flatten() });
  }
  const { cardBrand, cardLast4, holderName, expiry, isDefault } = parse.data;
  const p = prisma as any;
  // Duplicate detection (same user + brand + last4 + expiry)
  const existing = await p.paymentMethod.findMany({ where: { userId: uid } });
  const dup = existing.find(
    (m: any) =>
      m.cardBrand === cardBrand &&
      m.cardLast4 === cardLast4 &&
      (m.expiry || null) === (expiry || null)
  );
  if (dup) return res.status(409).json({ error: 'duplicate_payment_method' });

  const created = await p.paymentMethod.create({
    data: { userId: uid, cardBrand, cardLast4, holderName, expiry, isDefault: !!isDefault },
  });
  if (isDefault) {
    await p.paymentMethod.updateMany({
      where: { userId: uid, id: { not: created.id } },
      data: { isDefault: false },
    });
  }
  return res.status(201).json(created);
});

paymentMethodsRouter.put('/payment-methods/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const id = req.params.id;
  const p = prisma as any;
  const existing = await p.paymentMethod.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });

  // Allow partial update – run schema but make fields optional by wrapping in partial.
  const partialSchema = baseSchema.partial();
  const parse = partialSchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid_payload', details: parse.error.flatten() });
  }
  const { cardBrand, cardLast4, holderName, expiry, isDefault } = parse.data;

  // If changing identifying trio, check duplicates
  if (cardBrand || cardLast4 || expiry) {
    const others = await p.paymentMethod.findMany({ where: { userId: uid } });
    const dup = others.find(
      (m: any) =>
        m.id !== id &&
        (cardBrand ?? existing.cardBrand) === m.cardBrand &&
        (cardLast4 ?? existing.cardLast4) === m.cardLast4 &&
        ((expiry ?? existing.expiry) || null) === (m.expiry || null)
    );
    if (dup) return res.status(409).json({ error: 'duplicate_payment_method' });
  }

  const updated = await p.paymentMethod.update({
    where: { id },
    data: {
      ...(cardBrand !== undefined ? { cardBrand } : {}),
      ...(cardLast4 !== undefined ? { cardLast4 } : {}),
      ...(holderName !== undefined ? { holderName } : {}),
      ...(expiry !== undefined ? { expiry } : {}),
      ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
    },
  });
  if (isDefault) {
    await p.paymentMethod.updateMany({
      where: { userId: uid, id: { not: updated.id } },
      data: { isDefault: false },
    });
  }
  return res.json(updated);
});

paymentMethodsRouter.delete('/payment-methods/:id', requireAuth, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const id = req.params.id;
  const p = prisma as any;
  const existing = await p.paymentMethod.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== uid) return res.status(403).json({ error: 'Forbidden' });
  // perform delete
  if (p.paymentMethod.delete) {
    await p.paymentMethod.delete({ where: { id } });
  } else {
    // fallback: mutate in-memory store (test harness)
    if (p.paymentMethod && typeof p.paymentMethod._removePaymentMethod === 'function') {
      p.paymentMethod._removePaymentMethod(id);
    }
  }
  return res.json({ success: true });
});

export default paymentMethodsRouter;
