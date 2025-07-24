import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import type { ForYouTodayPayload } from '../@types/personalization';

export function useForYouToday(userId: string | undefined, storeId: string | undefined) {
  return useQuery<ForYouTodayPayload>({
    queryKey: ['forYouToday', userId, storeId],
    enabled: !!userId && !!storeId,
    queryFn: async () => {
      const res = await phase4Client.get<ForYouTodayPayload>(
        `/personalization/home?userId=${userId}&storeId=${storeId}`
      );
      return res.data;
    },
    staleTime: 15 * 60 * 1000,
  });
}
