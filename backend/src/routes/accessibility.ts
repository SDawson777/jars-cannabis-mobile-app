import { Router } from 'express';
import {
  getAccessibilitySettings,
  updateAccessibilitySettings,
} from '../controllers/accessibilityController';

export const accessibilityRouter = Router();

// GET /accessibility
accessibilityRouter.get('/accessibility', getAccessibilitySettings);

// PUT /accessibility
accessibilityRouter.put('/accessibility', updateAccessibilitySettings);

