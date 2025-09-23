import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { phase4Client } from '../api/phase4Client';

interface CartAction {
  endpoint: string;
  payload: any;
}

export function useOfflineCartQueue() {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const processQueue = async () => {
      const _state = await NetInfo.fetch();
      if (!_state.isConnected) return;
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
    const unsub = NetInfo.addEventListener(_state => {
      if (_state.isConnected) processQueue();
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
