import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

import { phase4Client } from '../api/phase4Client';
import { clientPost } from '../api/http';

interface CartAction {
  endpoint: string;
  payload: any;
}

export function useOfflineCartQueue() {
  const [pending, setPending] = useState(false);
  const processQueue = useCallback(async () => {
    const _state = await NetInfo.fetch();
    if (!_state.isConnected) return;
    const raw = await AsyncStorage.getItem('cartQueue');
    if (!raw) {
      setPending(false);
      return;
    }
    const queue: CartAction[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) {
      await AsyncStorage.removeItem('cartQueue');
      setPending(false);
      return;
    }
    for (const action of queue) {
      try {
        // Use clientPost so tests/mocks that expect phase4Client.post calls still work via the underlying client
        await clientPost<unknown, unknown>(phase4Client, action.endpoint, action.payload);
      } catch {
        // leave queue intact so it can retry later
        setPending(true);
        return;
      }
    }
    await AsyncStorage.removeItem('cartQueue');
    setPending(false);
  }, []);

  useEffect(() => {
    processQueue();
    const subscription: unknown = NetInfo.addEventListener(_state => {
      if (_state.isConnected) processQueue();
    });
    return () => {
      // Defensively handle different unsubscribe shapes or bad mocks
      if (typeof subscription === 'function') {
        // NetInfo returns an unsubscribe function in React Native
        try {
          (subscription as () => void)();
        } catch {
          // no-op
        }
        return;
      }
      const subAny = subscription as any;
      if (subAny && typeof subAny.unsubscribe === 'function') {
        try {
          subAny.unsubscribe();
        } catch {
          // no-op
        }
        return;
      }
      if (subAny && typeof subAny.remove === 'function') {
        try {
          subAny.remove();
        } catch {
          // no-op
        }
      }
      // Otherwise nothing to clean up
    };
  }, [processQueue]);

  const queueAction = async (action: CartAction) => {
    const raw = await AsyncStorage.getItem('cartQueue');
    const queue: CartAction[] = raw ? JSON.parse(raw) : [];
    queue.push(action);
    await AsyncStorage.setItem('cartQueue', JSON.stringify(queue));
    setPending(true);
    // If we're currently online, attempt to flush immediately so cart stays in sync
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      await processQueue();
    }
  };

  return { queueAction, pending };
}
