import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { cmsClient } from '../api/cmsClient';
import type { CMSTheme } from '../types/cmsExtra';

const CACHE_KEY = 'cms:theme';

async function fetchTheme(brandSlug?: string): Promise<CMSTheme> {
  const state = await NetInfo.fetch();
  const path = brandSlug ? `/content/theme?brand=${brandSlug}` : '/content/theme';
  
  if (!state.isConnected) {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CMSTheme;
    }
    throw new Error('Offline and no cached theme');
  }

  try {
    const res = await cmsClient.get<CMSTheme>(path);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    // Fallback to cache on error
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CMSTheme;
    }
    throw err;
  }
}

export function useCMSTheme(brandSlug?: string) {
  return useQuery<CMSTheme, Error>({
    queryKey: ['cmsTheme', brandSlug],
    queryFn: () => fetchTheme(brandSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Default theme fallback
export const DEFAULT_CMS_THEME: CMSTheme = {
  brandSlug: 'default',
  primaryColor: '#2E5D46',
  secondaryColor: '#8CD24C',
  backgroundColor: '#F9F9F9',
  accentColor: '#FFD700',
  cornerRadius: 12,
  darkModeEnabled: false,
  elevation: 'soft',
};
