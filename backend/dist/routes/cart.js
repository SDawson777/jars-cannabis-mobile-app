"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
exports.cartRouter = (0, express_1.Router)();
let cart = [];
// GET /cart
exports.cartRouter.get('/cart', (_req, res) => {
    res.json(cart);
});
// POST /cart - add item
exports.cartRouter.post('/cart', (req, res) => {
    cart.push(req.body);
    res.status(201).json(cart);
});
// PUT /cart/:itemId - update item
exports.cartRouter.put('/cart/:itemId', (req, res) => {
    const { itemId } = req.params;
    cart = cart.map(item => (item.id === itemId ? { ...item, ...req.body } : item));
    res.json(cart);
});
// DELETE /cart/:itemId
exports.cartRouter.delete('/cart/:itemId', (req, res) => {
    cart = cart.filter(item => item.id !== req.params.itemId);
    res.status(204).send();
});
