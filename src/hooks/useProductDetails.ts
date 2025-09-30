import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

import { phase4Client } from '../api/phase4Client';
import { clientGet } from '../api/http';
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
  const data = await clientGet<{ product?: CMSProduct; variants?: ProductVariant[] } | CMSProduct>(
    phase4Client,
    `/products/${productId}`,
    { params: { storeId } }
  );
  // normalize to { product, variants }
  const payload = (data as any) || {};
  const product: CMSProduct = (payload.product ?? payload) as CMSProduct;
  const variants: ProductVariant[] = (payload.variants ??
    (product as any).variants ??
    []) as ProductVariant[];
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
