import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import type { PersonalizedCardData } from '../types/personalization';
import { isValidPersonalizedCardData } from '../utils/typeGuards';
import { cachePersonalizedCard } from './useOfflinePersonalizedFallback';
import { UserConsentContext } from '../context/UserConsentContext';

export function usePersonalizedCard() {
  const { personalized } = useContext(UserConsentContext);

  return useQuery<PersonalizedCardData>({
    queryKey: ['personalizedCard', personalized],
    enabled: personalized,
    queryFn: async () => {
      const res = await phase4Client.get('/recommendations/for-you');
      if (isValidPersonalizedCardData(res.data)) {
        await cachePersonalizedCard(res.data);
        return res.data;
      }
      throw new Error('Invalid data');
    },
    staleTime: 15 * 60 * 1000,
  });
}
