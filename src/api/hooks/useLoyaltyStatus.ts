import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';

async function fetchLoyalty() {
  const res = await phase4Client.get('/loyalty');
  return res.data;
}

export function useLoyaltyStatus() {
  return useQuery<any, Error>({
    queryKey: ['loyaltyStatus'],
    queryFn: fetchLoyalty,
    retry: false,
    onError: (err: Error) => console.error(err),
  } as any);
}
