import { Router } from 'express';
import { prisma } from '../prismaClient';
import { admin } from '@server/firebaseAdmin';

export const webhookRouter = Router();

webhookRouter.post('/stripe', async (req, res) => {
  const event = req.body;
  try {
    const orderId = event?.data?.object?.metadata?.orderId;
    if (orderId) {
      const order = await (prisma as any).order?.findUnique({
        where: { id: orderId },
        include: { user: true },
      });
      if (order?.user?.fcmToken) {
        await admin.messaging().send({
          token: order.user.fcmToken,
          notification: {
            title: 'Order Update',
            body: `Your order ${order.id} is now ${order.status}.`,
          },
        });
      }
    }
  } catch {
    // swallow
  }
  res.json({ received: true });
});
