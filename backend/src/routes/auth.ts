import { Router } from 'express';
import {
  login,
  register,
  logout,
  forgotPassword,
} from '../controllers/authController';

export const authRouter = Router();

// POST /auth/login
authRouter.post('/auth/login', login);

// POST /auth/register
authRouter.post('/auth/register', register);

// POST /auth/logout
authRouter.post('/auth/logout', logout);

// POST /auth/forgot-password
authRouter.post('/auth/forgot-password', forgotPassword);
