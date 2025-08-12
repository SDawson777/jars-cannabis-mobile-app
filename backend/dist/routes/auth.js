"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/auth/register', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    try {
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prismaClient_1.prisma.user.create({ data: { email, passwordHash } });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({ token, user: { id: user.id, email: user.email } });
    }
    catch (err) {
        if (err?.code === 'P2002')
            return res.status(409).json({ error: 'Email already registered' });
        return res.status(500).json({ error: 'Register failed' });
    }
});
exports.authRouter.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const user = await prismaClient_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user: { id: user.id, email: user.email } });
});
exports.authRouter.post('/auth/forgot-password', async (_req, res) => {
    return res.status(202).json({ message: 'If the email exists, a reset has been sent.' });
});
exports.authRouter.post('/auth/logout', async (_req, res) => res.status(204).send());
