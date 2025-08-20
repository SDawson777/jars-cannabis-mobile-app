import { useQuery } from '@tanstack/react-query';

import { phase4Client } from '../phase4Client';

export interface DataCategory {
  id: string;
  label: string;
}

async function fetchCategories(): Promise<DataCategory[]> {
  const res = await phase4Client.get('/profile/data-categories');
  return res.data;
}

export function useDataCategories() {
  return useQuery<DataCategory[], Error>({
    queryKey: ['data-categories'],
    queryFn: fetchCategories,
    staleTime: 300000,
  });
}
