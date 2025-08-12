"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptional = exports.authRequired = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'unauthorized' });
    }
}
exports.authRequired = authRequired;
function authOptional(req, _res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    try {
        req.user = token ? jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET) : undefined;
    }
    catch {
        // ignore invalid token
    }
    next();
}
exports.authOptional = authOptional;
