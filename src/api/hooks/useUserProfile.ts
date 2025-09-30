import { useQuery } from '@tanstack/react-query';

import logger from '../../lib/logger';
import { phase4Client } from '../phase4Client';
import { clientGet } from '../http';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

async function fetchProfile(): Promise<UserProfile> {
  return clientGet<UserProfile>(phase4Client, '/profile');
}

export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 300000,
    retry: false,
    onError: (err: Error) => logger.error('useUserProfile error', { error: err }, err),
  } as any);
}
