"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRouter = void 0;
const express_1 = require("express");
exports.storesRouter = (0, express_1.Router)();
// GET /stores
exports.storesRouter.get('/stores', (_req, res) => {
    res.json([]);
});
// GET /stores/:id
exports.storesRouter.get('/stores/:id', (req, res) => {
    res.json({ id: req.params.id });
});
