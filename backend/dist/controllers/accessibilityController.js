"use strict";
// backend/src/controllers/accessibilityController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccessibilitySettings = exports.getAccessibilitySettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/accessibility-settings?userId=...
 * Fetches accessibility prefs for the given user.
 * Protected by authMiddleware, but still re-checks userId param if desired.
 */
async function getAccessibilitySettings(req, res) {
    const { userId } = req.query;
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
exports.getAccessibilitySettings = getAccessibilitySettings;
/**
 * PATCH /api/accessibility-settings
 * Body: { userId, textSize, colorContrast, animationsEnabled }
 * Creates or updates the user’s accessibility settings.
 */
async function updateAccessibilitySettings(req, res) {
    const { userId, textSize, colorContrast, animationsEnabled } = req.body;
    const updated = await prisma.accessibilitySetting.upsert({
        where: { userId },
        create: { userId, textSize, colorContrast, animationsEnabled },
        update: { textSize, colorContrast, animationsEnabled },
    });
    res.json(updated);
}
exports.updateAccessibilitySettings = updateAccessibilitySettings;
