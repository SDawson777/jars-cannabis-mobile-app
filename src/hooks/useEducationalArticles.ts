import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import { useCMSPreview } from '../context/CMSPreviewContext';
import type { CMSArticle } from '../types/cms';

const CACHE_KEY = 'cms:articles';

interface ArticleQueryParams {
  page?: number;
  limit?: number;
  tag?: string;
  channel?: string;
}

async function fetchArticles(
  params: ArticleQueryParams = {},
  preview: boolean
): Promise<CMSArticle[]> {
  const state = await NetInfo.fetch();
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.tag) queryString.set('tag', params.tag);
  if (params.channel) queryString.set('channel', params.channel);

  const path = `/content/articles${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const cacheKey = `${CACHE_KEY}:${path}${preview ? ':preview' : ''}`;

  if (!state.isConnected) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CMSArticle[];
    }
    throw new Error('Offline and no cached articles');
  }

  try {
    const res = await cmsClient.get<CMSArticle[]>(path, {
      headers: preview ? { 'X-Preview': 'true' } : undefined,
    });
    const articles = Array.isArray(res.data) ? res.data : [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(articles));
    return articles;
  } catch (err) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CMSArticle[];
    }
    throw err;
  }
}

export function useEducationalArticles(params: ArticleQueryParams = {}) {
  const { preview } = useCMSPreview();

  return useQuery<CMSArticle[], Error>({
    queryKey: ['cmsArticles', params, preview],
    queryFn: () => fetchArticles(params, preview),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
