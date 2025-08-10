"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsRouter = void 0;
const express_1 = require("express");
exports.recommendationsRouter = (0, express_1.Router)();
// GET /recommendations/for-you
exports.recommendationsRouter.get('/recommendations/for-you', (_req, res) => {
    res.json([]);
});
// GET /recommendations/related/:productId
exports.recommendationsRouter.get('/recommendations/related/:productId', (req, res) => {
    res.json([]);
});
