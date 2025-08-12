"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const firebaseAdmin_1 = __importDefault(require("../firebaseAdmin"));
exports.webhookRouter = (0, express_1.Router)();
exports.webhookRouter.post('/stripe', async (req, res) => {
    const event = req.body;
    try {
        const orderId = event?.data?.object?.metadata?.orderId;
        if (orderId) {
            const order = await prismaClient_1.prisma.order?.findUnique({
                where: { id: orderId },
                include: { user: true },
            });
            if (order?.user?.fcmToken) {
                await firebaseAdmin_1.default.messaging().send({
                    token: order.user.fcmToken,
                    notification: {
                        title: 'Order Update',
                        body: `Your order ${order.id} is now ${order.status}.`,
                    },
                });
            }
        }
    }
    catch {
        // swallow
    }
    res.json({ received: true });
});
