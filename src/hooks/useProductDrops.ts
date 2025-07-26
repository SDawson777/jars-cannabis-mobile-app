import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import type { CMSDrop } from '../types/cms';

async function fetchDrops() {
  const res = await cmsClient.get<CMSDrop[]>('/api/admin/drops');
  return res.data;
}

export function useProductDrops() {
  return useQuery<CMSDrop[], Error>({
    queryKey: ['cmsDrops'],
    queryFn: fetchDrops,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
