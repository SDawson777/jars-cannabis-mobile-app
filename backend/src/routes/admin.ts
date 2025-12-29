import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

export const adminRouter = Router();

adminRouter.get('/admin/ping', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ ok: true });
});
