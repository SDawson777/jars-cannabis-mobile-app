import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { PersonalizedCardData } from '../types/personalization';
import { isValidPersonalizedCardData } from '../utils/typeGuards';

const KEY = 'personalized_card_cache';

export function useOfflinePersonalizedFallback() {
  const [data, setData] = useState<PersonalizedCardData | undefined>();

  useEffect(() => {
    const load = async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (isValidPersonalizedCardData(parsed)) setData(parsed);
          } catch {
            /* ignore */
          }
        }
      }
    };
    load();
  }, []);

  return data;
}

export async function cachePersonalizedCard(card: PersonalizedCardData) {
  await AsyncStorage.setItem(KEY, JSON.stringify(card));
}
