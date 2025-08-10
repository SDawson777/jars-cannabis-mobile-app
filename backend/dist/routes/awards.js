"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardsRouter = void 0;
const express_1 = require("express");
const awardsController_1 = require("../controllers/awardsController");
exports.awardsRouter = (0, express_1.Router)();
// GET /awards/status
exports.awardsRouter.get('/awards/status', awardsController_1.getAwards);
