import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import type { CMSProduct } from '../types/cms';

async function fetchProducts() {
  const res = await cmsClient.get<CMSProduct[]>('/api/admin/products');
  return res.data;
}

export function useCMSProducts() {
  return useQuery<CMSProduct[], Error>({
    queryKey: ['cmsProducts'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
