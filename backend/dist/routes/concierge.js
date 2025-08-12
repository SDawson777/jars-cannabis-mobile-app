"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conciergeRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const prismaClient_1 = require("../prismaClient");
const openai_1 = __importDefault(require("openai"));
exports.conciergeRouter = (0, express_1.Router)();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
exports.conciergeRouter.post('/concierge/chat', auth_1.authOptional, async (req, res) => {
    const { message, history = [] } = req.body;
    const q = (message || '').toString().slice(0, 512);
    const products = await prismaClient_1.prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ],
        },
        take: 5,
    });
    const articles = await prismaClient_1.prisma.article.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { body: { contains: q, mode: 'insensitive' } },
            ],
        },
        take: 3,
    });
    const context = [
        `Approved Product Snippets:\n${products.map(p => `- ${p.name} (${p.strainType}) ${p.price}`).join('\n')}`,
        `Educational Articles:\n${articles.map(a => `- ${a.title}`).join('\n')}`,
    ].join('\n\n');
    const sys = "You are Jars Concierge, a friendly, compliant assistant. Do not give medical advice. Suggest products from context only. Offer to add to cart by returning {action:'add_to_cart', productId} when confident.";
    const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: sys },
            ...history,
            { role: 'user', content: `User message: ${message}\n\nCONTEXT:\n${context}` },
        ],
        temperature: 0.4,
    });
    res.json({
        reply: resp.choices[0]?.message?.content ?? 'Sorry, I did not catch that.',
        grounding: { products, articles },
    });
});
