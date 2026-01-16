// backend/src/routes/notifications.ts
// Push notification preferences, campaigns, and history

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const notificationsRouter = Router();

/**
 * GET /notifications/preferences
 * Get user's notification preferences
 */
notificationsRouter.get(
  '/notifications/preferences',
  requireAuth,
  async (req: Request, res: Response) => {
    const _uid = (req as any).user.userId as string;

    try {
      // In production, fetch from database
      const preferences = {
        pushEnabled: true,
        smsEnabled: true,
        emailEnabled: true,

        // Order notifications
        orderConfirmation: true,
        orderStatusUpdates: true,
        deliveryUpdates: true,
        orderReady: true,

        // Promotional
        dealAlerts: true,
        newProducts: true,
        flashSales: true,
        weeklyDeals: true,

        // Loyalty
        pointsUpdates: true,
        rewardAvailable: true,
        tierProgress: true,
        birthdayRewards: true,

        // Inventory
        backInStock: true,
        priceDrops: true,
        lowStock: false,

        // Compliance
        recallAlerts: true,
        regulatoryUpdates: true,

        // Account
        securityAlerts: true,
        accountUpdates: true,

        // Social
        communityUpdates: false,
        friendActivity: false,

        // Quiet hours
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        quietHoursTimezone: 'America/Los_Angeles',
      };

      res.json(preferences);
    } catch (error) {
      console.error('Notification preferences error:', error);
      res.status(500).json({ error: 'Failed to get notification preferences' });
    }
  }
);

/**
 * PUT /notifications/preferences
 * Update notification preferences
 */
notificationsRouter.put(
  '/notifications/preferences',
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = (req as any).user.userId as string;
    const updates = req.body;

    try {
      // In production, save to database
      console.log(`Updating notification preferences for user ${uid}:`, updates);

      res.json({
        success: true,
        preferences: updates,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
);

/**
 * GET /notifications/channels
 * Get notification channels with status
 */
notificationsRouter.get(
  '/notifications/channels',
  requireAuth,
  async (req: Request, res: Response) => {
    const _uid = (req as any).user.userId as string;

    try {
      res.json({
        channels: [
          {
            id: 'push',
            name: 'Push Notifications',
            description: 'Get instant alerts on your device',
            isEnabled: true,
            isAvailable: true,
          },
          {
            id: 'sms',
            name: 'SMS',
            description: 'Receive text messages',
            isEnabled: true,
            isAvailable: true,
            phoneNumber: '***-***-1234',
          },
          {
            id: 'email',
            name: 'Email',
            description: 'Receive email notifications',
            isEnabled: true,
            isAvailable: true,
            email: 'u***@example.com',
          },
        ],
      });
    } catch (error) {
      console.error('Channels error:', error);
      res.status(500).json({ error: 'Failed to get channels' });
    }
  }
);

/**
 * POST /notifications/channels/:channelId/toggle
 * Toggle a notification channel
 */
notificationsRouter.post(
  '/notifications/channels/:channelId/toggle',
  requireAuth,
  async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { enabled } = req.body;

    try {
      res.json({
        channelId,
        isEnabled: enabled,
      });
    } catch (error) {
      console.error('Toggle channel error:', error);
      res.status(500).json({ error: 'Failed to toggle channel' });
    }
  }
);

/**
 * GET /notifications/quiet-hours
 * Get quiet hours settings
 */
notificationsRouter.get(
  '/notifications/quiet-hours',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      res.json({
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/Los_Angeles',
        overrideForUrgent: true,
      });
    } catch (error) {
      console.error('Quiet hours error:', error);
      res.status(500).json({ error: 'Failed to get quiet hours' });
    }
  }
);

/**
 * PUT /notifications/quiet-hours
 * Update quiet hours settings
 */
notificationsRouter.put(
  '/notifications/quiet-hours',
  requireAuth,
  async (req: Request, res: Response) => {
    const { enabled, startTime, endTime, timezone, overrideForUrgent } = req.body;

    try {
      res.json({
        enabled,
        startTime,
        endTime,
        timezone,
        overrideForUrgent,
      });
    } catch (error) {
      console.error('Update quiet hours error:', error);
      res.status(500).json({ error: 'Failed to update quiet hours' });
    }
  }
);

/**
 * GET /notifications/topics
 * Get available subscription topics
 */
notificationsRouter.get(
  '/notifications/topics',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      res.json({
        topics: [
          {
            id: 'deals',
            name: 'Daily Deals',
            description: 'Get notified about daily specials',
            isSubscribed: true,
          },
          {
            id: 'new_strains',
            name: 'New Strains',
            description: 'Be first to know about new arrivals',
            isSubscribed: true,
          },
          {
            id: 'flash_sales',
            name: 'Flash Sales',
            description: 'Limited-time offers and flash sales',
            isSubscribed: false,
          },
          {
            id: 'events',
            name: 'Events & Promotions',
            description: 'Store events and special promotions',
            isSubscribed: true,
          },
          {
            id: 'education',
            name: 'Cannabis Education',
            description: 'Tips, guides, and educational content',
            isSubscribed: false,
          },
          {
            id: 'community',
            name: 'Community Updates',
            description: 'News from the Nimbus community',
            isSubscribed: false,
          },
        ],
      });
    } catch (error) {
      console.error('Topics error:', error);
      res.status(500).json({ error: 'Failed to get topics' });
    }
  }
);

/**
 * POST /notifications/topics/:topicId/subscribe
 * Subscribe to a notification topic
 */
notificationsRouter.post(
  '/notifications/topics/:topicId/subscribe',
  requireAuth,
  async (req: Request, res: Response) => {
    const { topicId } = req.params;

    try {
      // In production, subscribe via FCM
      res.json({
        topicId,
        isSubscribed: true,
      });
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({ error: 'Failed to subscribe to topic' });
    }
  }
);

/**
 * POST /notifications/topics/:topicId/unsubscribe
 * Unsubscribe from a notification topic
 */
notificationsRouter.post(
  '/notifications/topics/:topicId/unsubscribe',
  requireAuth,
  async (req: Request, res: Response) => {
    const { topicId } = req.params;

    try {
      // In production, unsubscribe via FCM
      res.json({
        topicId,
        isSubscribed: false,
      });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({ error: 'Failed to unsubscribe from topic' });
    }
  }
);

/**
 * GET /notifications/history
 * Get notification history
 */
notificationsRouter.get(
  '/notifications/history',
  requireAuth,
  async (req: Request, res: Response) => {
    const { cursor: _cursor, limit: _limit = '20', type } = req.query;

    try {
      const notifications = [
        {
          id: 'notif-1',
          type: 'order_status',
          title: 'Order Ready for Pickup',
          body: 'Your order #ORD-123456 is ready at Nimbus SF',
          imageUrl: null,
          data: { orderId: 'order-123' },
          readAt: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'notif-2',
          type: 'deal',
          title: '🔥 Flash Sale!',
          body: '25% off all concentrates - today only',
          imageUrl: '/deals/flash-sale.png',
          data: { dealId: 'deal-456' },
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'notif-3',
          type: 'loyalty',
          title: 'Reward Unlocked! 🎉',
          body: 'You have enough points to redeem a free pre-roll',
          imageUrl: null,
          data: { rewardId: 'reward-3' },
          readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'notif-4',
          type: 'back_in_stock',
          title: 'Back in Stock!',
          body: 'Blue Dream 3.5g is back in stock at your store',
          imageUrl: '/products/blue-dream.png',
          data: { productId: 'prod-789' },
          readAt: null,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const filtered = type ? notifications.filter(n => n.type === type) : notifications;

      res.json({
        notifications: filtered,
        hasMore: false,
        nextCursor: undefined,
        unreadCount: filtered.filter(n => !n.readAt).length,
      });
    } catch (error) {
      console.error('Notification history error:', error);
      res.status(500).json({ error: 'Failed to get notification history' });
    }
  }
);

/**
 * POST /notifications/:notificationId/read
 * Mark a notification as read
 */
notificationsRouter.post(
  '/notifications/:notificationId/read',
  requireAuth,
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    try {
      res.json({
        id: notificationId,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

/**
 * POST /notifications/read-all
 * Mark all notifications as read
 */
notificationsRouter.post(
  '/notifications/read-all',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        markedCount: 2,
      });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  }
);

/**
 * POST /notifications/register-device
 * Register device for push notifications
 */
notificationsRouter.post(
  '/notifications/register-device',
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = (req as any).user.userId as string;
    const { token, platform, deviceId } = req.body;

    if (!token || !platform) {
      return res.status(400).json({ error: 'token and platform are required' });
    }

    try {
      // In production, store FCM/APNs token
      console.log(`Registering device for user ${uid}: ${platform} - ${deviceId}`);

      res.json({
        success: true,
        deviceId: deviceId || `device-${Date.now()}`,
      });
    } catch (error) {
      console.error('Register device error:', error);
      res.status(500).json({ error: 'Failed to register device' });
    }
  }
);

/**
 * DELETE /notifications/unregister-device
 * Unregister device from push notifications
 */
notificationsRouter.delete(
  '/notifications/unregister-device',
  requireAuth,
  async (req: Request, res: Response) => {
    const { deviceId: _deviceId } = req.body;

    try {
      res.json({ success: true });
    } catch (error) {
      console.error('Unregister device error:', error);
      res.status(500).json({ error: 'Failed to unregister device' });
    }
  }
);

// ============================================
// CMS/Admin Campaign Endpoints (for editors)
// ============================================

/**
 * GET /notifications/campaigns
 * Get scheduled notification campaigns (admin)
 */
notificationsRouter.get(
  '/notifications/campaigns',
  requireAuth,
  async (req: Request, res: Response) => {
    // In production, check admin permissions

    try {
      res.json({
        campaigns: [
          {
            id: 'campaign-1',
            name: 'Weekend Flash Sale',
            message: {
              title: '🎉 Weekend Sale!',
              body: 'Up to 30% off select products',
              imageUrl: '/campaigns/weekend-sale.png',
            },
            targetAudience: 'all',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            createdBy: 'admin@nimbus.app',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'campaign-2',
            name: 'New Product Launch',
            message: {
              title: 'New Arrival 🌿',
              body: 'Check out our newest strain: Purple Haze',
            },
            targetAudience: 'subscribers:new_strains',
            scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            createdBy: 'marketing@nimbus.app',
            createdAt: new Date().toISOString(),
          },
        ],
      });
    } catch (error) {
      console.error('Campaigns error:', error);
      res.status(500).json({ error: 'Failed to get campaigns' });
    }
  }
);

/**
 * POST /notifications/campaigns
 * Create a notification campaign (admin)
 */
notificationsRouter.post(
  '/notifications/campaigns',
  requireAuth,
  async (req: Request, res: Response) => {
    const { name, message, targetAudience, scheduledAt, sendImmediately } = req.body;

    if (!name || !message || !message.title || !message.body) {
      return res.status(400).json({ error: 'name, message.title, and message.body are required' });
    }

    try {
      const campaign = {
        id: `campaign-${Date.now()}`,
        name,
        message,
        targetAudience: targetAudience || 'all',
        scheduledAt: sendImmediately ? new Date().toISOString() : scheduledAt,
        status: sendImmediately ? 'sent' : 'scheduled',
        createdAt: new Date().toISOString(),
      };

      res.status(201).json({ campaign });
    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  }
);

/**
 * DELETE /notifications/campaigns/:campaignId
 * Cancel a scheduled campaign (admin)
 */
notificationsRouter.delete(
  '/notifications/campaigns/:campaignId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    try {
      res.json({ success: true, campaignId });
    } catch (error) {
      console.error('Cancel campaign error:', error);
      res.status(500).json({ error: 'Failed to cancel campaign' });
    }
  }
);

export { notificationsRouter as notificationRouter };
