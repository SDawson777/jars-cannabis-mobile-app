// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';

interface JwtPayload {
  userId: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring(7); // remove 'Bearer '
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    // Attach to req.user for downstream handlers
    (req as any).user = { id: payload.userId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
