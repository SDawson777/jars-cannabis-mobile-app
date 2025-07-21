'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.login = void 0;
const client_1 = require('@prisma/client');
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const bcrypt_1 = __importDefault(require('bcrypt'));
const prisma = new client_1.PrismaClient();
/**
 * POST /api/login
 * Body: { email: string; password: string }
 * Verifies credentials and returns { token } if valid.
 */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  // Look up user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Compare password hash
  const valid = await bcrypt_1.default.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Sign a JWT
  const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ token });
}
exports.login = login;
