import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phase4Client } from '../api/phase4Client';
import type { CMSProduct } from '../types/cms';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface ProductDetails {
  product: CMSProduct;
  variants: ProductVariant[];
}

async function fetchProduct(productId: string, storeId?: string): Promise<ProductDetails> {
  const res = await phase4Client.get(`/products/${productId}`, { params: { storeId } });
  return res.data;
}

export function useProductDetails(productId: string | undefined, storeId?: string) {
  return useQuery<ProductDetails, Error>({
    queryKey: ['productDetails', productId, storeId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) throw new Error('Missing productId');
      const cacheKey = `productDetails:${productId}:${storeId || 'all'}`;
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ProductDetails;
        throw new Error('Offline');
      }
      try {
        const data = await fetchProduct(productId, storeId);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as ProductDetails;
        throw err;
      }
    },
  });
}
