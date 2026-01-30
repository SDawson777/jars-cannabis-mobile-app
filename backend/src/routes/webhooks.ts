import { Router, raw } from 'express';
import Stripe from 'stripe';
import { prisma } from '../prismaClient';
import { sendPushNotification } from '../services/pushService';
import { env } from '../env';
import { logger } from '../utils/logger';

export const webhookRouter = Router();

// Lazily initialize Stripe to avoid module-level fetch requirement
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }
  return stripe;
}

// Use raw body parser for webhook signature verification
webhookRouter.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  // Verify webhook signature if secret is configured
  let event: Stripe.Event | null = null;

  // In production, always require signature verification
  if (env.NODE_ENV === 'production' && !webhookSecret) {
    logger.error('webhook.stripe.no_secret', {
      message: 'Webhook secret not configured in production',
    });
    return res.status(500).json({ error: 'Webhook verification not configured' });
  }

  if (webhookSecret) {
    // Secret is configured, signature is required
    if (!sig) {
      logger.warn('webhook.stripe.missing_signature', { hasSecret: true });
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    const s = getStripe();
    if (!s) {
      logger.error('webhook.stripe.no_client', { message: 'Stripe client not initialized' });
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    try {
      event = s.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      logger.warn('webhook.stripe.signature_failed', { error: err?.message });
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  } else {
    // Development mode only - allow unverified webhooks for testing
    logger.warn('webhook.stripe.dev_mode', {
      message: 'Processing webhook without signature verification',
    });
    event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  if (!event) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  try {
    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'checkout.session.completed': {
        const paymentObject = event.data.object as any;
        const orderId = paymentObject?.metadata?.orderId;
        if (orderId) {
          const order = await (prisma as any).order?.findUnique({
            where: { id: orderId },
            include: { user: true },
          });
          if (order?.user?.id) {
            logger.info('webhook.stripe.order_notification', { orderId, eventType: event.type });
            await sendPushNotification({
              userId: order.user.id,
              token: order.user.fcmToken,
              notification: {
                title: 'Payment Confirmed',
                body: `Your order ${order.id} payment has been confirmed!`,
              },
              data: {
                orderId: order.id,
                status: String(order.status),
              },
            });
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentObject = event.data.object as any;
        const orderId = paymentObject?.metadata?.orderId;
        if (orderId) {
          logger.warn('webhook.stripe.payment_failed', { orderId });
          const order = await (prisma as any).order?.findUnique({
            where: { id: orderId },
            include: { user: true },
          });
          if (order?.user?.id) {
            await sendPushNotification({
              userId: order.user.id,
              token: order.user.fcmToken,
              notification: {
                title: 'Payment Failed',
                body: `Your payment for order ${order.id} was unsuccessful. Please try again.`,
              },
              data: {
                orderId: order.id,
                status: 'payment_failed',
              },
            });
          }
        }
        break;
      }
      default:
        logger.debug('webhook.stripe.unhandled_event', { type: event.type });
    }
  } catch (error: any) {
    logger.error('webhook.stripe.processing_error', { error: error?.message });
    // Still return 200 to acknowledge receipt - Stripe will retry on non-2xx
  }
  res.json({ received: true });
});
