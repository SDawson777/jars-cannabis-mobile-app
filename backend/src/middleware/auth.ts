import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { admin } from '../bootstrap/firebase-admin';
import { env } from '../env';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    (req as any).user = jwt.verify(token, env.JWT_SECRET);
    const uid = (req as any).user?.userId || (req as any).user?.id;
    if (uid && (req as any).log && typeof (req as any).log.child === 'function') {
      (req as any).log = (req as any).log.child({ userId: uid });
    }
    return next();
  } catch {
    // Try verifying as a Firebase ID token (if firebase admin is available)
    try {
      if (admin && typeof admin.auth === 'function') {
        return admin
          .auth()
          .verifyIdToken(token)
          .then((p: any) => {
            (req as any).user = { userId: p.uid };
            if ((req as any).log && typeof (req as any).log.child === 'function') {
              (req as any).log = (req as any).log.child({ userId: p.uid });
            }
            return next();
          })
          .catch(() => res.status(401).json({ error: 'Invalid token' }));
      }
    } catch {
      // fall through to invalid token response
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
