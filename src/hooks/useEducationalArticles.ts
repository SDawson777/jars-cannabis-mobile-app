import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import type { CMSArticle } from '../types/cms';

async function fetchArticles() {
  const res = await cmsClient.get<CMSArticle[]>('/api/greenhouse/articles');
  return res.data;
}

export function useEducationalArticles() {
  return useQuery<CMSArticle[], Error>({
    queryKey: ['cmsArticles'],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
