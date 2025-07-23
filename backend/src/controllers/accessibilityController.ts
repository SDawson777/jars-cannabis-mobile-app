// backend/src/controllers/accessibilityController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Typed query and body shapes
type GetSettingsQuery = { userId: string };
type UpdateBody = {
  userId: string;
  textSize: string;
  colorContrast: string;
  animationsEnabled: boolean;
};

/**
 * GET /api/accessibility-settings?userId=...
 * Fetches accessibility prefs for the given user.
 * Protected by authMiddleware, but still re-checks userId param if desired.
 */
export async function getAccessibilitySettings(req: Request, res: Response) {
  const { userId } = req.query as unknown as GetSettingsQuery;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }

  const settings = await prisma.accessibilitySetting.findUnique({
    where: { userId },
  });
  if (!settings) {
    return res.status(404).json({ error: 'Settings not found' });
  }
  res.json(settings);
}

/**
 * PATCH /api/accessibility-settings
 * Body: { userId, textSize, colorContrast, animationsEnabled }
 * Creates or updates the user’s accessibility settings.
 */
export async function updateAccessibilitySettings(req: Request, res: Response) {
  const { userId, textSize, colorContrast, animationsEnabled } = req.body as UpdateBody;

  const updated = await prisma.accessibilitySetting.upsert({
    where: { userId },
    create: { userId, textSize, colorContrast, animationsEnabled },
    update: { textSize, colorContrast, animationsEnabled },
  });
  res.json(updated);
}
