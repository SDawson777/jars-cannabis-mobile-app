"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = void 0;
const prismaClient_1 = require("../../prismaClient");
const firebase_admin_1 = __importDefault(require("../../bootstrap/firebase-admin"));
async function updateOrderStatus(orderId, status) {
    const order = await prismaClient_1.prisma.order?.update({
        where: { id: orderId },
        data: { status },
        include: { user: true },
    });
    if (order?.user?.fcmToken) {
        await firebase_admin_1.default.messaging().send({
            token: order.user.fcmToken,
            notification: {
                title: 'Order Update',
                body: `Your order ${order.id} is now ${status}.`,
            },
        });
    }
    return order;
}
exports.updateOrderStatus = updateOrderStatus;
