import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phase4Client } from '../api/phase4Client';

interface CartAction {
  endpoint: string;
  payload: any;
}

export function useOfflineCartQueue() {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const processQueue = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return;
      const raw = await AsyncStorage.getItem('cartQueue');
      if (!raw) {
        setPending(false);
        return;
      }
      const queue: CartAction[] = JSON.parse(raw);
      for (const action of queue) {
        try {
          await phase4Client.post(action.endpoint, action.payload);
        } catch {
          return;
        }
      }
      await AsyncStorage.removeItem('cartQueue');
      setPending(false);
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
    setPending(true);
  };

  return { queueAction, pending };
}
