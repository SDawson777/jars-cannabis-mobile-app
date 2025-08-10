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
// Profile preferences (phase 4)
let preferences = { highContrast: false };
exports.profileRouter.get('/profile/preferences', (_req, res) => {
    res.json(preferences);
});
exports.profileRouter.put('/profile/preferences', (req, res) => {
    preferences = { ...preferences, ...req.body };
    res.json(preferences);
});
