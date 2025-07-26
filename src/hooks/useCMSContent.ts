import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { cmsClient } from '../api/cmsClient';
import { useCMSPreview } from '../context/CMSPreviewContext';

export function useCMSContent<T>(key: string[], path: string) {
  const { preview } = useCMSPreview();

  return useQuery<T, Error>({
    queryKey: [...key, preview],
    queryFn: async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        throw new Error('Offline');
      }
      const res = await cmsClient.get<T>(path, {
        headers: preview ? { 'X-Preview': 'true' } : undefined,
      });
      return res.data;
    },
  });
}
