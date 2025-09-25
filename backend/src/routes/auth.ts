import { Router } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';
import { env } from '../env';

const authRouter = Router();

authRouter.post('/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  // basic validation expected by tests
  if (typeof email === 'string' && !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: 'Invalid email' });
  if (typeof password === 'string' && password.length < 6)
    return res.status(400).json({ error: 'password too weak' });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Email already registered' });
    return res.status(500).json({ error: 'Register failed' });
  }
});

authRouter.post('/auth/login', async (req, res) => {
  const { email, password, idToken } = req.body || {};

  // If idToken present, verify with Firebase and find/create corresponding user
  if (idToken) {
    try {
      const { admin } = await import('../firebaseAdmin');
      const decoded = await admin.auth().verifyIdToken(idToken as string);
      const uid = decoded.uid as string;
      // Find user by uid first, then by email
      let user = await prisma.user.findUnique({ where: { id: uid } });
      if (!user && decoded.email) {
        user = await prisma.user.findUnique({ where: { email: decoded.email } });
      }
      if (!user) {
        // create a local user record with firebase uid
        user = await prisma.user.create({
          data: { id: uid, email: decoded.email ?? undefined } as any,
        });
      }
      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch {
      return res.status(401).json({ error: 'Invalid idToken' });
    }
  }

  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

authRouter.post('/auth/forgot-password', async (_req, res) => {
  return res.status(202).json({ message: 'If the email exists, a reset has been sent.' });
});

authRouter.post('/auth/logout', async (_req, res) => res.status(200).json({ ok: true }));

// POST /auth/refresh - expects { refreshToken }
authRouter.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ error: 'Missing token' });
  try {
    // Use the top-level jwt import (mocked in tests) instead of dynamic import
    const payload: any = (jwt as any).verify(refreshToken, env.JWT_SECRET);
    if (!payload?.userId) return res.status(401).json({ error: 'Invalid token' });
    const token = (jwt as any).sign({ userId: payload.userId }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
    return res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /auth/me - return current user info
authRouter.get('/auth/me', requireAuth, async (req, res) => {
  const uid = (req as any).user?.userId as string;
  if (!uid) return res.status(401).json({ error: 'Missing token' });
  const u = await prisma.user.findUnique({ where: { id: uid } });
  if (!u) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: { id: u.id, email: u.email } });
});

export { authRouter };
