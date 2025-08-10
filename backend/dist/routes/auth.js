"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
exports.authRouter = (0, express_1.Router)();
// POST /auth/login
exports.authRouter.post('/auth/login', authController_1.login);
// POST /auth/register
exports.authRouter.post('/auth/register', authController_1.register);
// POST /auth/logout
exports.authRouter.post('/auth/logout', authController_1.logout);
// POST /auth/forgot-password
exports.authRouter.post('/auth/forgot-password', authController_1.forgotPassword);
