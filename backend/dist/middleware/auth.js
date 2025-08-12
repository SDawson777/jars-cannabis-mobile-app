"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
exports.requireAuth = requireAuth;
