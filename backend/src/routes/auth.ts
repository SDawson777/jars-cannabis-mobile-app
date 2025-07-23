import { Router } from 'express';
import { login } from '../controllers/authController';

export const authRouter = Router();

// POST /auth/login
authRouter.post('/auth/login', login);
