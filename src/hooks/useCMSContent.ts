import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cmsClient } from '../api/cmsClient';
import { useCMSPreview } from '../context/CMSPreviewContext';

export function useCMSContent<T>(key: string[], path: string) {
  const { preview } = useCMSPreview();

  return useQuery<T, Error>({
    queryKey: [...key, preview],
    queryFn: async () => {
      const state = await NetInfo.fetch();
      const cacheKey = `cms:${path}${preview ? ':preview' : ''}`;

      if (!state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached) as T;
        }
        throw new Error('Offline');
      }

      try {
        const res = await cmsClient.get<T>(path, {
          headers: preview ? { 'X-Preview': 'true' } : undefined,
        });
        await AsyncStorage.setItem(cacheKey, JSON.stringify(res.data));
        return res.data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached) as T;
        }
        throw err;
      }
    },
  });
}
