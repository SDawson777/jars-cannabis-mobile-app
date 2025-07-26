import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { phase4Client } from '../api/phase4Client';
import type { ForYouTodayPayload } from '../@types/personalization';

export function useForYouToday(userId: string | undefined, storeId: string | undefined) {
  return useQuery<ForYouTodayPayload>({
    queryKey: ['forYouToday', userId, storeId],
    enabled: !!userId && !!storeId,
    queryFn: async () => {
      const cacheKey = `forYouToday:${userId}:${storeId}`;
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ForYouTodayPayload;
        throw new Error('Offline');
      }

      try {
        const res = await phase4Client.get<ForYouTodayPayload>(
          `/personalization/home?userId=${userId}&storeId=${storeId}`
        );
        await AsyncStorage.setItem(cacheKey, JSON.stringify(res.data));
        return res.data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ForYouTodayPayload;
        throw err;
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}
