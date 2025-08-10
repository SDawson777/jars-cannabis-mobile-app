"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greenhouseRouter = void 0;
const express_1 = require("express");
exports.greenhouseRouter = (0, express_1.Router)();
// GET /greenhouse/articles
exports.greenhouseRouter.get('/greenhouse/articles', (_req, res) => {
    res.json([]);
});
// GET /greenhouse/articles/:slug
exports.greenhouseRouter.get('/greenhouse/articles/:slug', (req, res) => {
    res.json({ slug: req.params.slug });
});
// POST /greenhouse/articles/:slug/complete
exports.greenhouseRouter.post('/greenhouse/articles/:slug/complete', (req, res) => {
    res.json({ slug: req.params.slug, completed: true });
});
