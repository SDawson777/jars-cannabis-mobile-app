"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conciergeRouter = void 0;
const express_1 = require("express");
exports.conciergeRouter = (0, express_1.Router)();
// Simple chat endpoint backed by OpenAI
// eslint-disable-next-line @typescript-eslint/no-misused-promises
exports.conciergeRouter.post('/concierge/chat', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const { message, history = [] } = req.body || {};
    if (!apiKey)
        return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
    if (!message)
        return res.status(400).json({ error: 'message required' });
    const { default: OpenAI } = await Promise.resolve().then(() => __importStar(require('openai')));
    const client = new OpenAI({ apiKey });
    const msgs = [
        { role: 'system', content: 'You are a helpful budtender. Keep answers concise and safe.' },
        ...history,
        { role: 'user', content: String(message) },
    ];
    const r = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: msgs,
        temperature: 0.4,
    });
    const reply = r.choices?.[0]?.message?.content ?? 'Sorry, I had trouble answering that.';
    res.json({ reply });
});
