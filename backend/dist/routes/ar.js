"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arRouter = void 0;
const express_1 = require("express");
exports.arRouter = (0, express_1.Router)();
// GET /ar/models/:productId
exports.arRouter.get('/ar/models/:productId', (_req, res) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});
