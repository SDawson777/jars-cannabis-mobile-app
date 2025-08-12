"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arRouter = void 0;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.arRouter = (0, express_1.Router)();
exports.arRouter.get('/ar/models/:productId', (req, res) => {
    const p = path_1.default.join(process.cwd(), 'public', 'ar', `${req.params.productId}.gltf`);
    if (!fs_1.default.existsSync(p))
        return res.status(404).json({ error: 'model not found' });
    res.sendFile(p);
});
