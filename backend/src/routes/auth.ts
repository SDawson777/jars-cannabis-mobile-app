import { Router } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

authRouter.post('/auth/register', async (req, res) => {
const { email, password } = req.body || {};
if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
try {
const passwordHash = await bcrypt.hash(password, 10);
const user = await prisma.user.create({ data: { email, passwordHash } });
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
return res.status(201).json({ token, user: { id: user.id, email: user.email } });
} catch (err: any) {
if (err?.code === 'P2002') return res.status(409).json({ error: 'Email already registered' });
return res.status(500).json({ error: 'Register failed' });
}
});

authRouter.post('/auth/login', async (req, res) => {
const { email, password } = req.body || {};
if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
return res.json({ token, user: { id: user.id, email: user.email } });
});

authRouter.post('/auth/forgot-password', async (_req, res) => {
return res.status(202).json({ message: 'If the email exists, a reset has been sent.' });
});

authRouter.post('/auth/logout', async (_req, res) => res.status(204).send());
