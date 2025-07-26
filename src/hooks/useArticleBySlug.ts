import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import type { CMSArticle } from '../types/cms';

async function fetchArticle(slug: string) {
  const res = await cmsClient.get<CMSArticle>(`/api/greenhouse/articles/${slug}`);
  return res.data;
}

export function useArticleBySlug(slug: string) {
  return useQuery<CMSArticle, Error>({
    queryKey: ['cmsArticle', slug],
    queryFn: () => fetchArticle(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
}
