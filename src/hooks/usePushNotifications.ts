// src/hooks/usePushNotifications.ts
import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phase4Client } from '../api/phase4Client';
import { logEvent } from '../utils/analytics';

const PUSH_ENABLED_KEY = '@nimbus:push_enabled';
const PUSH_TOKEN_KEY = '@nimbus:push_token';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook to manage push notification registration and preferences
 */
export function usePushNotifications() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PUSH_ENABLED_KEY);
        setIsEnabled(stored === 'true');
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
        setToken(storedToken);
      } catch {
        setIsEnabled(false);
      }
    })();
  }, []);

  // Register for push notifications
  const registerForPush = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Push notification permission denied');
        logEvent('push_permission_denied', {});
        return null;
      }

      // Get Expo push token (works for both FCM and APNs)
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      const pushToken = tokenData.data;

      // Send token to backend
      await phase4Client.post('/profile/push-token', { token: pushToken });

      // Store locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);
      await AsyncStorage.setItem(PUSH_ENABLED_KEY, 'true');

      setToken(pushToken);
      setIsEnabled(true);
      logEvent('push_registered', { platform: Platform.OS });

      return pushToken;
    } catch (err: any) {
      const message = err?.message || 'Failed to register for push notifications';
      setError(message);
      logEvent('push_registration_error', { error: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unregister from push notifications
  const unregisterFromPush = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear local storage
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      await AsyncStorage.setItem(PUSH_ENABLED_KEY, 'false');

      // Optionally: Tell backend to remove token
      // await phase4Client.delete('/profile/push-token');

      setToken(null);
      setIsEnabled(false);
      logEvent('push_disabled', {});
    } catch (err: any) {
      setError(err?.message || 'Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle push notifications
  const togglePush = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (enabled) {
        await registerForPush();
      } else {
        await unregisterFromPush();
      }
    },
    [registerForPush, unregisterFromPush]
  );

  // Listen for notification received while app is foregrounded
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      logEvent('push_notification_received', {
        title: notification.request.content.title,
        data: notification.request.content.data,
      });
    });

    return () => Notifications.removeNotificationSubscription(subscription);
  }, []);

  // Listen for notification response (user tapped notification)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      logEvent('push_notification_tapped', {
        action: response.actionIdentifier,
        data,
      });

      // Handle deep linking based on notification data
      if (data?.screen) {
        // Navigation would be handled by the app's navigation container
        // This is just logging for now
        logEvent('push_deeplink', { screen: data.screen });
      }
    });

    return () => Notifications.removeNotificationSubscription(subscription);
  }, []);

  return {
    isEnabled,
    token,
    isLoading,
    error,
    registerForPush,
    unregisterFromPush,
    togglePush,
  };
}

/**
 * Schedules a local notification (for testing or reminders)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  triggerSeconds?: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: triggerSeconds ? { seconds: triggerSeconds } : null,
  });
}
