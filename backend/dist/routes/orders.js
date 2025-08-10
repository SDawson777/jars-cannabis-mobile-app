"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
exports.ordersRouter = (0, express_1.Router)();
let orders = [];
// POST /orders - create order
exports.ordersRouter.post('/orders', (req, res) => {
    const order = { id: String(orders.length + 1), ...req.body };
    orders.push(order);
    res.status(201).json(order);
});
// GET /orders - list orders
exports.ordersRouter.get('/orders', (_req, res) => {
    res.json(orders);
});
// GET /orders/:id - order detail
exports.ordersRouter.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order)
        return res.status(404).json({ message: 'Order not found' });
    res.json(order);
});
