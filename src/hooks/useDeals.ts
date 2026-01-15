import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import type { CMSDeal } from '../types/cmsExtra';

const CACHE_KEY = 'cms:deals';

async function fetchDeals(): Promise<CMSDeal[]> {
  const state = await NetInfo.fetch();
  
  if (!state.isConnected) {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CMSDeal[];
    }
    throw new Error('Offline and no cached deals');
  }

  try {
    const res = await cmsClient.get<CMSDeal[] | { items: CMSDeal[] }>('/content/deals');
    const deals = Array.isArray(res.data) ? res.data : res.data.items ?? [];
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(deals));
    return deals;
  } catch (err) {
    // Fallback to cache on error
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CMSDeal[];
    }
    throw err;
  }
}

/** Filter deals to only include active ones (current date between start and end) */
function filterActiveDeals(deals: CMSDeal[]): CMSDeal[] {
  const now = new Date();
  return deals.filter(deal => {
    const startDate = new Date(deal.startDate);
    const endDate = new Date(deal.endDate);
    return now >= startDate && now <= endDate;
  });
}

export function useDeals() {
  return useQuery<CMSDeal[], Error>({
    queryKey: ['cmsDeals'],
    queryFn: fetchDeals,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: filterActiveDeals, // Only return active deals
  });
}

export function useAllDeals() {
  return useQuery<CMSDeal[], Error>({
    queryKey: ['cmsDeals'],
    queryFn: fetchDeals,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    // Returns all deals without filtering
  });
}
