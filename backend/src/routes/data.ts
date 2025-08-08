import { Router } from 'express';
import { requestExport } from '../controllers/dataTransparencyController';

export const dataRouter = Router();

// POST /data/export
dataRouter.post('/data/export', requestExport);

