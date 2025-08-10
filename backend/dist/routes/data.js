"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataRouter = void 0;
const express_1 = require("express");
const dataTransparencyController_1 = require("../controllers/dataTransparencyController");
exports.dataRouter = (0, express_1.Router)();
// POST /data/export
exports.dataRouter.post('/data/export', dataTransparencyController_1.requestExport);
