import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useInfiniteQuery } from '@tanstack/react-query';

import { phase4Client } from '../api/phase4Client';
import type { CMSProduct } from '../types/cms';

const PAGE_SIZE = 20;

interface ProductPage {
  products: CMSProduct[];
  page: number;
  hasNextPage: boolean;
}

async function fetchPage(page: number, storeId?: string, filter?: string): Promise<ProductPage> {
  const res = await phase4Client.get<{ products: CMSProduct[]; total?: number }>('/products', {
    params: { page, limit: PAGE_SIZE, storeId, filter },
  });
  const products = res.data.products ?? (res.data as any) ?? [];
  return { products, page, hasNextPage: products.length === PAGE_SIZE };
}

export function useProducts(storeId?: string, filter?: string) {
  return useInfiniteQuery<ProductPage, Error>({
    queryKey: ['products', storeId, filter],
    queryFn: async ({ pageParam = 1 }) => {
      const cacheKey = `products:${storeId || 'all'}:${filter || 'all'}:${pageParam}`;
      const _state = await NetInfo.fetch();

      if (!_state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ProductPage;
        throw new Error('Offline');
      }

      try {
        const data = await fetchPage(pageParam, storeId, filter);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ProductPage;
        throw err;
      }
    },
    getNextPageParam: (lastPage: ProductPage, pages: ProductPage[]) =>
      lastPage.hasNextPage ? pages.length + 1 : undefined,
    initialPageParam: 1,
  } as any);
}
