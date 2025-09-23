import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import { useCMSPreview } from '../context/CMSPreviewContext';
import type { CMSArticle } from '../types/cms';

async function fetchArticle(slug: string, preview: boolean) {
  const cacheKey = `cms:article:${slug}${preview ? ':preview' : ''}`;
  try {
    const res = await cmsClient.get<CMSArticle>(`/content/articles/${slug}`, {
      headers: preview ? { 'X-Preview': 'true' } : undefined,
    });
    await AsyncStorage.setItem(cacheKey, JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as CMSArticle;
    throw err;
  }
}

export function useArticleBySlug(slug: string) {
  const { preview } = useCMSPreview();
  return useQuery<CMSArticle, Error>({
    queryKey: ['cmsArticle', slug, preview],
    queryFn: async () => {
      const _state = await NetInfo.fetch();
      if (!_state.isConnected) {
        return fetchArticle(slug, preview);
      }
      return fetchArticle(slug, preview);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
}
