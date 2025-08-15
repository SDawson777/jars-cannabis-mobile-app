import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';

export interface LoyaltyStatus {
  points: number;
  level: string;
}

async function fetchLoyalty(): Promise<LoyaltyStatus> {
  const res = await phase4Client.get('/loyalty');
  return res.data;
}

export function useLoyaltyStatus() {
  return useQuery<LoyaltyStatus, Error>({
    queryKey: ['loyaltyStatus'],
    queryFn: fetchLoyalty,
    retry: false,
  });
}
