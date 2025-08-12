"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = void 0;
const prismaClient_1 = require("../../prismaClient");
const firebaseAdmin_1 = require("../../firebaseAdmin");
const admin = (0, firebaseAdmin_1.getAdmin)();
async function updateOrderStatus(orderId, status) {
    const order = await prismaClient_1.prisma.order?.update({
        where: { id: orderId },
        data: { status },
        include: { user: true },
    });
    if (order?.user?.fcmToken) {
        await admin.messaging().send({
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
