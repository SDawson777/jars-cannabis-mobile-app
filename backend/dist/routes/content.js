"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
exports.contentRouter = (0, express_1.Router)();
exports.contentRouter.get('/content/faq', async (req, res) => {
    const locale = req.query.locale || 'en-US';
    const pages = await prismaClient_1.prisma.contentPage.findMany({ where: { type: 'faq', locale, published: true } });
    res.json({ items: pages });
});
exports.contentRouter.get('/content/legal', async (req, res) => {
    const locale = req.query.locale || 'en-US';
    const pages = await prismaClient_1.prisma.contentPage.findMany({ where: { type: 'legal', locale, published: true } });
    res.json({ items: pages });
});
