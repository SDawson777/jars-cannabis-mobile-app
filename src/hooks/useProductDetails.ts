import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

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

// The backend returns { product, relatedProducts } where product may include variants
async function fetchProduct(productId: string, storeId?: string): Promise<ProductDetails> {
  const res = await phase4Client.get(`/products/${productId}`, { params: { storeId } });
  // normalize to { product, variants }
  const payload = res.data || {};
  const product = payload.product ?? payload;
  const variants: ProductVariant[] =
    (product && ((product.variants ?? product.variants) as any)) || [];
  // ensure variants are in the expected shape (fallback empty)
  return { product, variants };
}

export function useProductDetails(productId: string | undefined, storeId?: string) {
  return useQuery<ProductDetails, Error>({
    queryKey: ['productDetails', productId, storeId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) throw new Error('Missing productId');
      const cacheKey = `productDetails:${productId}:${storeId || 'all'}`;
      const _state = await NetInfo.fetch();
      if (!_state.isConnected) {
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
