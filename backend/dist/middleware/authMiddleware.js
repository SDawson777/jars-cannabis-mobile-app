'use strict';
// backend/src/middleware/authMiddleware.ts
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.substring(7); // remove 'Bearer '
  try {
    const secret = process.env.JWT_SECRET;
    const payload = jsonwebtoken_1.default.verify(token, secret);
    // Attach to req.user for downstream handlers
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
exports.authMiddleware = authMiddleware;
