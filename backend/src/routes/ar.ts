import { Router } from 'express';
import path from 'path';
import fs from 'fs';

export const arRouter = Router();

arRouter.get('/ar/models/:productId', (req, res) => {
  const p = path.join(process.cwd(), 'public', 'ar', `${req.params.productId}.gltf`);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'model not found' });
  res.sendFile(p);
});
