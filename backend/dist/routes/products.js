"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
exports.productsRouter = (0, express_1.Router)();
// GET /products
exports.productsRouter.get('/products', (_req, res) => {
    res.json([]);
});
// GET /products/:id
exports.productsRouter.get('/products/:id', (req, res) => {
    res.json({ id: req.params.id });
});
// GET /products/:id/reviews
exports.productsRouter.get('/products/:id/reviews', (req, res) => {
    res.json([]);
});
// POST /products/:id/reviews
exports.productsRouter.post('/products/:id/reviews', (req, res) => {
    res.status(201).json({ id: req.params.id, review: req.body });
});
