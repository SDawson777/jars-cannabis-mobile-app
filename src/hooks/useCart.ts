import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { phase4Client } from '../api/phase4Client';
import { useCartStore } from '../../stores/useCartStore';

import { useOfflineCartQueue } from './useOfflineCartQueue';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { queueAction, pending } = useOfflineCartQueue();
  const [loadingFromCache, setLoadingFromCache] = useState(false);

  const setStoreItems = (cartPayload: any) => {
    try {
      if (Array.isArray(cartPayload?.items)) {
        const mapped = cartPayload.items.map((i: any) => ({
          id: i.productId ?? i.id,
          name: i.name ?? i.product?.name ?? 'Item',
          // fallback price/qty
          price: i.price ?? i.product?.price ?? 0,
          quantity: i.quantity ?? 1,
          variantId: i.variantId,
          available: i.available !== false,
        }));
        useCartStore.getState().setItems(mapped);
      }
    } catch (_e) {
      // Non-fatal: if mapping fails we leave the store unchanged.
    }
  };

  const fetchCart = async (): Promise<Cart> => {
    const _state = await NetInfo.fetch();
    if (!_state.isConnected) {
      const cached = await AsyncStorage.getItem('cart');
      if (cached) {
        setLoadingFromCache(true);
        const parsed = JSON.parse(cached) as Cart;
        setStoreItems(parsed);
        return parsed;
      }
      throw new Error('Offline');
    }
    const { data } = await phase4Client.get('/cart');
    // backend returns { cart: { items: [...], total } }
    const cartPayload = data?.cart ?? data;
    await AsyncStorage.setItem('cart', JSON.stringify(cartPayload));
    setStoreItems(cartPayload);
    return cartPayload;
  };

  const query = useQuery<Cart, Error>({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  useEffect(() => {
    setLoadingFromCache(false);
  }, [query.data]);

  const mutation = useMutation<Cart, Error, any>({
    mutationFn: async body => {
      const _state = await NetInfo.fetch();
      const isItemsPayload = Array.isArray(body?.items);
      const isPromoPayload = 'promo' in (body || {});
      const payload = isItemsPayload
        ? { items: body.items }
        : isPromoPayload
          ? { promo: (body as any).promo }
          : body;
      if (!_state.isConnected) {
        await queueAction({ endpoint: '/cart/update', payload });
        throw new Error('queued');
      }
      const { data } = await phase4Client.post('/cart/update', payload);
      // backend returns { cart: {...} }
      return data?.cart ?? data;
    },
    onMutate: async vars => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
      if (prev) {
        const optim = { ...prev, ...vars } as Cart;
        queryClient.setQueryData(['cart'], optim);
      }
      return { prev };
    },
    onError: (err, vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
    },
    onSuccess: data => {
      queryClient.setQueryData(['cart'], data);
      setStoreItems(data);
      AsyncStorage.setItem('cart', JSON.stringify(data)).catch(() => {});
    },
  });

  const applyPromo = async (code: string) => {
    await mutation.mutateAsync({ promo: code } as any);
  };

  return {
    cart: query.data,
    isLoading: query.isLoading && !loadingFromCache,
    isFetching: query.isFetching,
    error: query.error,
    updateCart: mutation.mutateAsync,
    // convenience helper to send an array of items: { items: [...] }
    addItems: async (items: any[]) => mutation.mutateAsync({ items }),
    addItem: async (item: any) => {
      // Normalize legacy shape id -> productId if needed
      const normalized = {
        productId: item.productId ?? item.id,
        quantity: item.quantity ?? 1,
        price: item.price,
        variantId: item.variantId,
      };
      return mutation.mutateAsync({ items: [normalized] });
    },
    applyPromo,
    refetchCart: query.refetch,
    hasPending: pending,
  };
}
