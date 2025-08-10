"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentRouter = void 0;
const express_1 = require("express");
exports.contentRouter = (0, express_1.Router)();
// GET /content/faq
exports.contentRouter.get('/content/faq', (_req, res) => {
    res.json([]);
});
// GET /content/legal
exports.contentRouter.get('/content/legal', (_req, res) => {
    res.json({});
});
