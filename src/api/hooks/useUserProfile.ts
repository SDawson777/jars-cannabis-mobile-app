import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await phase4Client.get('/profile');
  return res.data;
}

export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 300000,
    retry: false,
    onError: (err: Error) => console.error(err),
  } as any);
}
