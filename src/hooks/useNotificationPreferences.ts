// src/hooks/useNotificationPreferences.ts
// Notification preferences and campaign subscription management
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../utils/analytics';

export interface NotificationPreferences {
  // Order updates
  orderConfirmation: boolean;
  orderPreparing: boolean;
  orderReady: boolean;
  orderOutForDelivery: boolean;
  orderDelivered: boolean;

  // Deals & promotions
  dailyDeals: boolean;
  flashSales: boolean;
  personalizedOffers: boolean;
  newProductAlerts: boolean;

  // Loyalty & rewards
  pointsEarned: boolean;
  rewardsAvailable: boolean;
  tierUpgrade: boolean;
  pointsExpiring: boolean;

  // Compliance & safety
  recallAlerts: boolean;
  complianceUpdates: boolean;

  // Account
  securityAlerts: boolean;
  accountUpdates: boolean;

  // Engagement
  backInStock: boolean;
  priceDrops: boolean;
  recommendationsDigest: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  category: 'orders' | 'deals' | 'loyalty' | 'compliance' | 'account' | 'engagement';
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface ScheduledNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  scheduledFor: string;
  data?: Record<string, any>;
}

const PREFERENCES_KEY = '@nimbus:notification_preferences';

const defaultPreferences: NotificationPreferences = {
  orderConfirmation: true,
  orderPreparing: true,
  orderReady: true,
  orderOutForDelivery: true,
  orderDelivered: true,
  dailyDeals: true,
  flashSales: true,
  personalizedOffers: true,
  newProductAlerts: false,
  pointsEarned: true,
  rewardsAvailable: true,
  tierUpgrade: true,
  pointsExpiring: true,
  recallAlerts: true,
  complianceUpdates: true,
  securityAlerts: true,
  accountUpdates: true,
  backInStock: true,
  priceDrops: false,
  recommendationsDigest: false,
  quietHoursEnabled: false,
};

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferences, Error>({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      try {
        // Try to get from server first
        const serverPrefs = await clientGet<NotificationPreferences>(
          phase4Client,
          '/profile/notification-preferences'
        );
        // Cache locally
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(serverPrefs));
        return serverPrefs;
      } catch {
        // Fall back to local storage
        const local = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (local) {
          return JSON.parse(local) as NotificationPreferences;
        }
        return defaultPreferences;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreferences, Error, Partial<NotificationPreferences>>({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const result = await clientPost<Partial<NotificationPreferences>, NotificationPreferences>(
        phase4Client,
        '/profile/notification-preferences',
        updates
      );
      // Update local cache
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(result));
      logEvent('notification_preferences_updated', { keys: Object.keys(updates) });
      return result;
    },
    onSuccess: (data: NotificationPreferences) => {
      queryClient.setQueryData(['notifications', 'preferences'], data);
    },
  });
}

/**
 * Hook to fetch notification channels
 */
export function useNotificationChannels() {
  return useQuery<NotificationChannel[], Error>({
    queryKey: ['notifications', 'channels'],
    queryFn: async () => {
      const res = await clientGet<{ channels: NotificationChannel[] }>(
        phase4Client,
        '/notifications/channels'
      );
      return res.channels || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to toggle a notification channel
 */
export function useToggleNotificationChannel() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { channelId: string; enabled: boolean; method?: 'push' | 'email' | 'sms' }
  >({
    mutationFn: async ({
      channelId,
      enabled,
      method,
    }: {
      channelId: string;
      enabled: boolean;
      method?: 'push' | 'email' | 'sms';
    }) => {
      await clientPost<{ enabled: boolean; method?: string }, void>(
        phase4Client,
        `/notifications/channels/${channelId}/toggle`,
        { enabled, method }
      );
      logEvent('notification_channel_toggled', { channelId, enabled, method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'channels'] });
    },
  });
}

/**
 * Hook to manage quiet hours
 */
export function useQuietHours() {
  const { data: preferences } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const setQuietHours = useCallback(
    async (start: string, end: string) => {
      await updatePreferences.mutateAsync({
        quietHoursEnabled: true,
        quietHoursStart: start,
        quietHoursEnd: end,
      });
    },
    [updatePreferences]
  );

  const disableQuietHours = useCallback(async () => {
    await updatePreferences.mutateAsync({
      quietHoursEnabled: false,
    });
  }, [updatePreferences]);

  return {
    enabled: preferences?.quietHoursEnabled || false,
    start: preferences?.quietHoursStart,
    end: preferences?.quietHoursEnd,
    setQuietHours,
    disableQuietHours,
    isUpdating: updatePreferences.isPending,
  };
}

/**
 * Hook to subscribe to specific notification topics
 */
export function useSubscribeToTopic() {
  return useMutation<void, Error, string>({
    mutationFn: async (topic: string) => {
      await clientPost<{ topic: string }, void>(phase4Client, '/notifications/subscribe', {
        topic,
      });
      logEvent('notification_topic_subscribed', { topic });
    },
  });
}

/**
 * Hook to unsubscribe from specific notification topics
 */
export function useUnsubscribeFromTopic() {
  return useMutation<void, Error, string>({
    mutationFn: async (topic: string) => {
      await clientPost<{ topic: string }, void>(phase4Client, '/notifications/unsubscribe', {
        topic,
      });
      logEvent('notification_topic_unsubscribed', { topic });
    },
  });
}

/**
 * Hook to get notification history
 */
export function useNotificationHistory() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await clientGet<{ notifications: ScheduledNotification[] }>(
        phase4Client,
        '/notifications/history'
      );
      setNotifications(res.notifications || []);
    } catch {
      // Silent fail
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await clientPost<object, void>(phase4Client, `/notifications/${notificationId}/read`, {});
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch {
      // Silent fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await clientPost<object, void>(phase4Client, '/notifications/read-all', {});
      setNotifications([]);
    } catch {
      // Silent fail
    }
  }, []);

  return {
    notifications,
    fetchHistory,
    markAsRead,
    markAllAsRead,
  };
}
