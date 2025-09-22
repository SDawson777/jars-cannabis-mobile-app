import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { phase4Client } from '../api/phase4Client';

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

  const fetchCart = async (): Promise<Cart> => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      const cached = await AsyncStorage.getItem('cart');
      if (cached) {
        setLoadingFromCache(true);
        return JSON.parse(cached) as Cart;
      }
      throw new Error('Offline');
    }
    const { data } = await phase4Client.get('/cart');
    // backend returns { cart: { items: [...], total } }
    const cartPayload = data?.cart ?? data;
    await AsyncStorage.setItem('cart', JSON.stringify(cartPayload));
    return cartPayload;
  };

  const query = useQuery<Cart, Error>({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  useEffect(() => {
    setLoadingFromCache(false);
  }, [query.data]);

  const mutation = useMutation<Cart, Error, Partial<Cart>>({
    mutationFn: async body => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        // ensure payload matches backend expectation: { items: [...] }
        const payload = body.items ? body : { items: (body as any).items ?? [] };
        await queueAction({ endpoint: '/cart/update', payload });
        throw new Error('queued');
      }
      const payload = body.items ? body : { items: (body as any).items ?? [] };
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
    addItems: async (items: Partial<CartItem>[]) => {
      return mutation.mutateAsync({ items } as any);
    },
    // convenience helper to add a single item (keeps backwards compatibility)
    addItem: async (item: Partial<CartItem>) => {
      // If caller passes legacy shape { productId, quantity } copy into item.id
      // The server expects productId in items; preserve caller fields (productId/quantity/price/variantId)
      return mutation.mutateAsync({ items: [item] } as any);
    },
    applyPromo,
    refetchCart: query.refetch,
    hasPending: pending,
  };
}
