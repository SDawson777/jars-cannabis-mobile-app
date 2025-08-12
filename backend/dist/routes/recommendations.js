"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../util/auth");
const service_1 = require("../modules/recommendations/service");
exports.recommendationsRouter = (0, express_1.Router)();
exports.recommendationsRouter.get('/recommendations/for-you', auth_1.authOptional, async (req, res) => {
    const userId = req.user?.id;
    const storeId = req.query.storeId || undefined;
    const data = await (0, service_1.forYou)(userId, storeId);
    res.json({ items: data });
});
exports.recommendationsRouter.get('/recommendations/related/:productId', async (req, res) => {
    const storeId = req.query.storeId || undefined;
    const data = await (0, service_1.relatedTo)(req.params.productId, storeId);
    res.json({ items: data });
});
