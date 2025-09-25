// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // or: import * as bcrypt from 'bcryptjs'
import { env } from '../env';

const prisma = new PrismaClient();

function getJwtSecret(): string {
  const s = env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

/**
 * POST /auth/register
 * Body: { email: string; password: string }
 */
export async function register(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);

  // Only fields that exist in your Prisma model
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1h' });
  return res.status(201).json({ token, user: { id: user.id, email: user.email } });
}

/**
 * POST /auth/login
 * Body: { email: string; password: string }
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1h' });
  return res.json({ token, user: { id: user.id, email: user.email } });
}

export async function logout(_req: Request, res: Response) {
  return res.status(204).send();
}

export async function forgotPassword(_req: Request, res: Response) {
  return res.status(202).json({ message: 'If the email exists, a reset link will be sent.' });
}
