import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import type { ForYouTodayPayload } from '../@types/personalization';
import { phase4Client } from '../api/phase4Client';
import { clientGet } from '../api/http';

export function useForYouToday(userId: string | undefined, storeId: string | undefined) {
  return useQuery<ForYouTodayPayload>({
    queryKey: ['forYouToday', userId, storeId],
    enabled: !!userId && !!storeId,
    queryFn: async () => {
      const cacheKey = `forYouToday:${userId}:${storeId}`;
      const _state = await NetInfo.fetch();

      if (!_state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ForYouTodayPayload;
        throw new Error('Offline');
      }

      try {
        const data = await clientGet<ForYouTodayPayload>(
          phase4Client,
          `/personalization/home?userId=${userId}&storeId=${storeId}`
        );
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ForYouTodayPayload;
        throw err;
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}
