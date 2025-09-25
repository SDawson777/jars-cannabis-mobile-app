import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  try {
    (req as any).user = jwt.verify(token, env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  try {
    (req as any).user = token ? jwt.verify(token, env.JWT_SECRET!) : undefined;
  } catch {
    // ignore invalid token
  }
  next();
}
