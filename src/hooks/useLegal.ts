import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import type { LegalContent } from '../types/cmsExtra';

interface FullLegalContent {
  terms?: string;
  privacy?: string;
  accessibility?: string;
  stateNotices?: Record<string, string>;
  lastUpdated?: Record<string, string | null>;
}

async function fetchLegalContent(stateCode?: string): Promise<FullLegalContent> {
  const cacheKey = `cms:legal${stateCode ? `:${stateCode}` : ''}`;
  const state = await NetInfo.fetch();
  
  const path = stateCode 
    ? `/content/legal?state=${stateCode}` 
    : '/content/legal';

  if (!state.isConnected) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as FullLegalContent;
    }
    throw new Error('Offline and no cached legal content');
  }

  try {
    const res = await cmsClient.get<FullLegalContent>(path);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as FullLegalContent;
    }
    throw err;
  }
}

export function useLegal(stateCode?: string) {
  return useQuery<FullLegalContent, Error>({
    queryKey: ['legal', stateCode],
    queryFn: () => fetchLegalContent(stateCode),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/** Hook for a specific legal document type */
export function useLegalByType(type: 'terms' | 'privacy' | 'accessibility', stateCode?: string) {
  const query = useLegal(stateCode);
  
  return {
    ...query,
    data: query.data ? {
      title: type.charAt(0).toUpperCase() + type.slice(1),
      body: query.data[type] || '',
      lastUpdated: query.data.lastUpdated?.[type],
    } as LegalContent & { lastUpdated?: string | null } : undefined,
  };
}
