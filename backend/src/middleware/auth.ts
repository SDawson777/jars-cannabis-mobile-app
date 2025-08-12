import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = { userId: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
const h = req.headers.authorization || '';
const token = h.startsWith('Bearer ') ? h.slice(7) : null;
if (!token) return res.status(401).json({ error: 'Missing token' });
try {
(req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
return next();
} catch {
return res.status(401).json({ error: 'Invalid token' });
}
}
