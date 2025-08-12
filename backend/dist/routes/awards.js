"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardsRouter = void 0;
const express_1 = require("express");
exports.awardsRouter = (0, express_1.Router)();
exports.awardsRouter.get('/awards/status', async (_req, res) => {
    res.json({
        active: true,
        season: '2025',
        categories: ['Top Reviewer', 'Community Helper', 'Greenhouse Scholar'],
    });
});
