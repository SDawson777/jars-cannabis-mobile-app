"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loyaltyRouter = void 0;
const express_1 = require("express");
exports.loyaltyRouter = (0, express_1.Router)();
// GET /loyalty/status
exports.loyaltyRouter.get('/loyalty/status', (_req, res) => {
    res.json({ status: 'bronze' });
});
// GET /loyalty/badges
exports.loyaltyRouter.get('/loyalty/badges', (_req, res) => {
    res.json([]);
});
