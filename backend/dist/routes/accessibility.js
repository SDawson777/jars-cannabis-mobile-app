"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibilityRouter = void 0;
const express_1 = require("express");
const accessibilityController_1 = require("../controllers/accessibilityController");
exports.accessibilityRouter = (0, express_1.Router)();
// GET /accessibility
exports.accessibilityRouter.get('/accessibility', accessibilityController_1.getAccessibilitySettings);
// PUT /accessibility
exports.accessibilityRouter.put('/accessibility', accessibilityController_1.updateAccessibilitySettings);
