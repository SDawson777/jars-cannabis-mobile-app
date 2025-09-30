import { useQuery } from '@tanstack/react-query';

import { phase4Client } from '../phase4Client';
import { clientGet } from '../http';

export interface DataCategory {
  id: string;
  label: string;
}

async function fetchCategories(): Promise<DataCategory[]> {
  return clientGet<DataCategory[]>(phase4Client, '/profile/data-categories');
}

export function useDataCategories() {
  return useQuery<DataCategory[], Error>({
    queryKey: ['data-categories'],
    queryFn: fetchCategories,
    staleTime: 300000,
  });
}
