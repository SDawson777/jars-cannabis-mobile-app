import { useQuery } from '@tanstack/react-query';

import { phase4Client } from '../phase4Client';
import { clientGet } from '../http';

export interface LoyaltyStatus {
  points: number;
  level: string;
}

async function fetchLoyalty(): Promise<LoyaltyStatus> {
  const d = (await clientGet<any>(phase4Client, '/loyalty/status')) || {};
  // Map backend record to the shape the UI expects
  return {
    points: d.points ?? d.balance ?? 0,
    level: d.level ?? d.tier ?? 'bronze',
  } as LoyaltyStatus;
}

export function useLoyaltyStatus() {
  return useQuery<LoyaltyStatus, Error>({
    queryKey: ['loyaltyStatus'],
    queryFn: fetchLoyalty,
    retry: false,
  });
}
