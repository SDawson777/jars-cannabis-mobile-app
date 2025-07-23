// backend/src/controllers/dataTransparencyController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { exportQueue } from '../queues/dataExportQueue';

const prisma = new PrismaClient();

interface RequestExportBody {
  userId: string;
}

/**
 * POST /api/data-transparency/export
 * Kick off a new data export for the given user.
 * Responds with { exportId, status }.
 */
export async function requestExport(req: Request<{}, any, RequestExportBody>, res: Response) {
  const { userId } = req.body;
  const exportId = uuidv4();

  try {
    // Create a pending record
    await prisma.dataExport.create({
      data: { id: exportId, userId, status: 'pending' },
    });

    // Enqueue the background job to generate the export
    await exportQueue.add({ exportId, userId });

    return res.json({ exportId, status: 'pending' });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}

/**
 * GET /api/data-transparency/export/:exportId
 * Return the current status (and downloadUrl if ready).
 */
export async function getExportStatus(req: Request<{ exportId: string }>, res: Response) {
  const { exportId } = req.params;

  try {
    const record = await prisma.dataExport.findUnique({
      where: { id: exportId },
    });

    if (!record) {
      return res.status(404).json({ error: 'Export not found' });
    }

    return res.json(record);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}

/**
 * DELETE /api/data-transparency/export/:exportId
 * Cancel (delete) a pending export.
 */
export async function cancelExport(req: Request<{ exportId: string }>, res: Response) {
  const { exportId } = req.params;

  try {
    await prisma.dataExport.delete({
      where: { id: exportId },
    });
    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
