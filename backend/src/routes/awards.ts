import { Router } from 'express';
import { getAwards } from '../controllers/awardsController';

export const awardsRouter = Router();

// GET /awards/status
awardsRouter.get('/awards/status', getAwards);

