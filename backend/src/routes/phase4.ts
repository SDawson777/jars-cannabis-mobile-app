// backend/src/routes/phase4.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getAwards,
  redeemAward,
  getAwardById,
} from '../controllers/awardsController';
import {
  requestExport,
  getExportStatus,
  cancelExport,
} from '../controllers/dataTransparencyController';
import {
  getAccessibilitySettings,
  updateAccessibilitySettings,
} from '../controllers/accessibilityController';

const router = Router();

// Awards endpoints (requires auth)
router.get('/awards', authMiddleware, getAwards);
router.post('/awards/redeem', authMiddleware, redeemAward);
// Public award details (no auth)
router.get('/awards/:awardId', getAwardById);

// Data-Transparency endpoints (requires auth)
router.post('/data-transparency/export', authMiddleware, requestExport);
router.get('/data-transparency/export/:exportId', authMiddleware, getExportStatus);
router.delete('/data-transparency/export/:exportId', authMiddleware, cancelExport);

// Accessibility endpoints (requires auth)
router.get('/accessibility-settings', authMiddleware, getAccessibilitySettings);
router.patch('/accessibility-settings', authMiddleware, updateAccessibilitySettings);

export default router;
