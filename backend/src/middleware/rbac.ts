import { Request, Response, NextFunction } from 'express';

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = (req as any).user || {};
    const roles: string[] = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}
