import { Router } from 'express';
export const arRouter = Router();
// Placeholder: respond 501 so clients handle gracefully (no 404)
arRouter.get('/ar/models/:productId', (_req, res) => {
  return res.status(501).json({ error: 'AR model rendering is not yet implemented.' });
});
