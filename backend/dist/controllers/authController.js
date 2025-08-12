"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // or: import * as bcrypt from 'bcryptjs'
const prisma = new client_1.PrismaClient();
function getJwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s)
        throw new Error('JWT_SECRET is not set');
    return s;
}
/**
 * POST /auth/register
 * Body: { email: string; password: string }
 */
async function register(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
        return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    // Only fields that exist in your Prisma model
    const user = await prisma.user.create({
        data: { email, passwordHash }
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1h' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
}
exports.register = register;
/**
 * POST /auth/login
 * Body: { email: string; password: string }
 */
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1h' });
    return res.json({ token, user: { id: user.id, email: user.email } });
}
exports.login = login;
async function logout(_req, res) {
    return res.status(204).send();
}
exports.logout = logout;
async function forgotPassword(_req, res) {
    return res.status(202).json({ message: 'If the email exists, a reset link will be sent.' });
}
exports.forgotPassword = forgotPassword;
