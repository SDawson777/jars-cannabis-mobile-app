"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
exports.profileRouter = (0, express_1.Router)();
let profile = { id: 'user-1', name: 'Demo User' };
// GET /profile
exports.profileRouter.get('/profile', (_req, res) => {
    res.json(profile);
});
// PUT /profile
exports.profileRouter.put('/profile', (req, res) => {
    profile = { ...profile, ...req.body };
    res.json(profile);
});
