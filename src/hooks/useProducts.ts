import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useInfiniteQuery } from '@tanstack/react-query';

import { phase4Client } from '../api/phase4Client';
import type { CMSProduct } from '../types/cms';

const PAGE_SIZE = 20;

async function fetchPage(page: number, storeId?: string, filter?: string) {
  const res = await phase4Client.get<CMSProduct[]>('/products', {
    params: { page, limit: PAGE_SIZE, storeId, filter },
  });
  return res.data;
}

export function useProducts(storeId?: string, filter?: string) {
  return useInfiniteQuery<CMSProduct[], Error>({
    queryKey: ['products', storeId, filter],
    queryFn: async ({ pageParam = 1 }) => {
      const cacheKey = `products:${storeId || 'all'}:${filter || 'all'}:${pageParam}`;
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as CMSProduct[];
        throw new Error('Offline');
      }

      try {
        const data = await fetchPage(pageParam, storeId, filter);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as CMSProduct[];
        throw err;
      }
    },
    getNextPageParam: (lastPage: CMSProduct[], pages: CMSProduct[][]) =>
      lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined,
    initialPageParam: 1,
  } as any);
}
