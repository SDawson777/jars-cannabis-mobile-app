"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalRouter = void 0;
const express_1 = require("express");
exports.journalRouter = (0, express_1.Router)();
let entries = [];
// GET /journal/entries
exports.journalRouter.get('/journal/entries', (_req, res) => {
    res.json(entries);
});
// POST /journal/entries
exports.journalRouter.post('/journal/entries', (req, res) => {
    const entry = { id: String(entries.length + 1), ...req.body };
    entries.push(entry);
    res.status(201).json(entry);
});
// PUT /journal/entries/:id
exports.journalRouter.put('/journal/entries/:id', (req, res) => {
    const { id } = req.params;
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1)
        return res.status(404).json({ message: 'Entry not found' });
    entries[idx] = { ...entries[idx], ...req.body };
    res.json(entries[idx]);
});
