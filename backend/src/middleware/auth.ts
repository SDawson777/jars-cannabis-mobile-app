import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
