import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import type { CMSBanner } from '../types/cms';

async function fetchBanners() {
  const res = await cmsClient.get<CMSBanner[]>('/api/admin/banners');
  return res.data;
}

export function useHomeBanners() {
  return useQuery<CMSBanner[], Error>({
    queryKey: ['cmsBanners'],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
