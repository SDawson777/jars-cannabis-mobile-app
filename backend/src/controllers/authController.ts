import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * POST /api/login
 * Body: { email: string; password: string }
 * Verifies credentials and returns { token } if valid.
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // Look up user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare password hash
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Sign a JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  res.json({ token });
}

/**
 * POST /auth/register
 * Simple placeholder registration endpoint.
 */
export async function register(_req: Request, res: Response) {
  res.json({ message: 'register endpoint' });
}

/**
 * POST /auth/logout
 * Placeholder logout endpoint.
 */
export async function logout(_req: Request, res: Response) {
  res.json({ message: 'logout endpoint' });
}

/**
 * POST /auth/forgot-password
 * Placeholder forgot password handler.
 */
export async function forgotPassword(_req: Request, res: Response) {
  res.json({ message: 'forgot-password endpoint' });
}
