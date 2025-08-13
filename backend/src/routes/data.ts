import { Router } from 'express';
import { prisma } from '../prismaClient';
import { authRequired } from '../util/auth';
import { admin, initFirebase } from '../bootstrap/firebase-admin';

export const dataRouter = Router();

// Start a data export job and upload results to Firebase Storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
dataRouter.post('/data-transparency/export', authRequired, async (req, res, next) => {
  try {
    const uid = (req as any).user.userId as string;
    const job = await prisma.dataExport.create({ data: { userId: uid, status: 'pending' } });

    // Early env validation for clearer errors
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      if (process.env.DEBUG_DIAG === '1') {
        return res.status(500).json({
          error: 'Firebase env missing',
          need: ['FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT_BASE64'],
        });
      }
      throw new Error('Firebase configuration missing');
    }
    initFirebase();
    const payload = {
      profile: await prisma.user.findUnique({ where: { id: uid } }),
      preferences: await prisma.userPreference.findUnique({ where: { userId: uid } }),
      accessibility: await prisma.accessibilitySetting.findUnique({ where: { userId: uid } }),
      orders: await prisma.order.findMany({ where: { userId: uid }, include: { items: true } }),
      reviews: await prisma.review.findMany({ where: { userId: uid } }),
      journal: await prisma.journalEntry.findMany({ where: { userId: uid } }),
      events: await prisma.userEvent.findMany({ where: { userId: uid } }),
    };

    const bucket = admin.storage().bucket();
    const file = bucket.file(`exports/${uid}/${job.id}.json`);
    await file.save(JSON.stringify(payload, null, 2), { contentType: 'application/json' });
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    const updated = await prisma.dataExport.update({
      where: { id: job.id },
      data: { status: 'ready', downloadUrl: url },
    });

    res.json({ exportId: updated.id, status: updated.status, downloadUrl: updated.downloadUrl });
  } catch (err: any) {
    if (process.env.DEBUG_DIAG === '1') {
      return res.status(500).json({ error: 'Export failed', message: err?.message || String(err) });
    }
    next(err);
  }
});

// Retrieve status of a previously requested data export
// eslint-disable-next-line @typescript-eslint/no-misused-promises
dataRouter.get('/data-transparency/export/:exportId', authRequired, async (req, res) => {
  const uid = (req as any).user.userId as string;
  const d = await prisma.dataExport.findFirst({ where: { id: req.params.exportId, userId: uid } });
  if (!d) return res.status(404).json({ error: 'Export not found' });
  res.json({ exportId: d.id, status: d.status, downloadUrl: d.downloadUrl });
});
