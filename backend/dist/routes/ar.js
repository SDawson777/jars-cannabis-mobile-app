"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arRouter = void 0;
const express_1 = require("express");
exports.arRouter = (0, express_1.Router)();
// Placeholder: respond 501 so clients handle gracefully (no 404)
exports.arRouter.get('/ar/models/:productId', (_req, res) => {
    return res.status(501).json({ error: 'AR model rendering is not yet implemented.' });
});
