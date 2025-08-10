"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conciergeRouter = void 0;
const express_1 = require("express");
exports.conciergeRouter = (0, express_1.Router)();
// POST /concierge/chat
exports.conciergeRouter.post('/concierge/chat', (_req, res) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});
