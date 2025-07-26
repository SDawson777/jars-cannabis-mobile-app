import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phase4Client } from '../api/phase4Client';

interface CartAction {
  type: 'add' | 'remove';
  payload: any;
}

export function useOfflineCartQueue() {
  useEffect(() => {
    const processQueue = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return;
      const raw = await AsyncStorage.getItem('cartQueue');
      if (!raw) return;
      const queue: CartAction[] = JSON.parse(raw);
      for (const action of queue) {
        try {
          await phase4Client.post('/cart/update', action);
        } catch {
          return;
        }
      }
      await AsyncStorage.removeItem('cartQueue');
    };
    processQueue();
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected) processQueue();
    });
    return () => unsub();
  }, []);

  const queueAction = async (action: CartAction) => {
    const raw = await AsyncStorage.getItem('cartQueue');
    const queue: CartAction[] = raw ? JSON.parse(raw) : [];
    queue.push(action);
    await AsyncStorage.setItem('cartQueue', JSON.stringify(queue));
  };

  return { queueAction };
}
