import { prisma } from '../../prismaClient';
import { getAdmin } from '@server/firebaseAdmin';
const admin = getAdmin();

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await (prisma as any).order?.update({
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
