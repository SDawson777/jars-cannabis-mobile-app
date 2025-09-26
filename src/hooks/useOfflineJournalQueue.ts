import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { addJournal, updateJournal } from '../api/phase4Client';

interface JournalAction {
  type: 'create' | 'update';
  id?: string; // For updates
  payload: {
    productId: string;
    rating?: number;
    notes?: string;
    tags?: string[];
  };
}

export function useOfflineJournalQueue() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const processQueue = async () => {
      try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) return;

        const raw = await AsyncStorage.getItem('journalQueue');
        if (!raw) {
          setPending(false);
          return;
        }

        const queue: JournalAction[] = JSON.parse(raw);
        if (queue.length === 0) {
          setPending(false);
          return;
        }

        const processedActions: JournalAction[] = [];

        for (const action of queue) {
          try {
            if (action.type === 'create') {
              await addJournal(action.payload);
            } else if (action.type === 'update' && action.id) {
              await updateJournal(action.id, action.payload);
            }
            processedActions.push(action);
          } catch (_error) {
            // If one fails, stop processing and keep remaining items in queue
            break;
          }
        }

        // Remove successfully processed actions from queue
        const remainingQueue = queue.slice(processedActions.length);
        if (remainingQueue.length === 0) {
          await AsyncStorage.removeItem('journalQueue');
          setPending(false);
        } else {
          await AsyncStorage.setItem('journalQueue', JSON.stringify(remainingQueue));
          setPending(remainingQueue.length > 0);
        }
      } catch (_error) {
        // Handle any errors gracefully
        setPending(false);
      }
    };

    processQueue();

    const subscription = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        processQueue();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const queueJournalAction = async (action: JournalAction) => {
    const raw = await AsyncStorage.getItem('journalQueue');
    const queue: JournalAction[] = raw ? JSON.parse(raw) : [];
    queue.push(action);
    await AsyncStorage.setItem('journalQueue', JSON.stringify(queue));
    setPending(true);
  };

  return { queueJournalAction, pending };
}
