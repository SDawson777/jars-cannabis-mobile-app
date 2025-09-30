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
  variantId?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { queueAction, pending } = useOfflineCartQueue();
  const [loadingFromCache, setLoadingFromCache] = useState(false);

  // Get normalized cart items from Zustand store
  const storeItems = useCartStore((state: any) => state.items);
  const appliedCoupon = useCartStore((state: any) => state.appliedCoupon);
  const setItems = useCartStore((state: any) => state.setItems);
  const setAppliedCoupon = useCartStore((state: any) => state.setAppliedCoupon);

  const setStoreItems = (cartPayload: any) => {
    try {
      if (Array.isArray(cartPayload?.items)) {
        const mapped = cartPayload.items.map((i: any) => ({
          id: i.productId ?? i.id,
          productId: i.productId ?? i.id, // always persist productId for future updates
          name: i.name ?? i.product?.name ?? 'Item',
          price: i.unitPrice ?? i.price ?? i.product?.defaultPrice ?? 0,
          quantity: i.quantity ?? 1,
          variantId: i.variantId,
          available: i.available !== false,
          image: i.image ?? i.imageUrl ?? i.product?.imageUrl ?? i.product?.image,
        }));
        setItems(mapped);
      }
      // Handle applied coupon from cart payload (support both keys)
      if (cartPayload?.appliedCoupon !== undefined) {
        setAppliedCoupon(cartPayload.appliedCoupon);
      } else if (cartPayload?.coupon !== undefined) {
        setAppliedCoupon(cartPayload.coupon);
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
    mutationFn: async (body: {
      items: any[];
      productId: any;
      id: any;
      variantId: any;
      quantity: any;
      price: any;
    }) => {
      const _state = await NetInfo.fetch();
      // Always normalize items payload to backend contract
      let items: any[] = [];
      if (Array.isArray(body?.items)) {
        items = body.items.map((item: any) => ({
          productId: item.productId ?? item.id,
          variantId: item.variantId,
          quantity: item.quantity ?? 1,
          price: item.price,
        }));
      } else if (body?.productId || body?.id) {
        items = [
          {
            productId: body.productId ?? body.id,
            variantId: body.variantId,
            quantity: body.quantity ?? 1,
            price: body.price,
          },
        ];
      }
      const isPromoPayload = 'promo' in (body || {});
      const payload =
        items.length > 0 ? { items } : isPromoPayload ? { promo: (body as any).promo } : body;
      if (!_state.isConnected) {
        await queueAction({ endpoint: '/cart/update', payload });
        throw new Error('queued');
      }
      const { data } = await phase4Client.post('/cart/update', payload);
      return data?.cart ?? data;
    },
    onMutate: async (vars: { items: any }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData(['cart']) as Cart | undefined;
      // Build an optimistic cart snapshot
      let next: Cart | undefined = prev ? { ...prev, items: [...(prev.items || [])] } : undefined;
      if (vars?.items && Array.isArray(vars.items)) {
        // Merge each incoming item by productId / id + variantId
        for (const incoming of vars.items) {
          const incomingId = incoming.productId ?? incoming.id;
          // fallback quantity
          const qty = incoming.quantity ?? 1;
          if (!next) {
            next = { items: [], total: 0 } as Cart;
          }
          const existing = next.items.find(
            (i: any) =>
              (i.id === incomingId || i.productId === incomingId) &&
              (i.variantId ?? null) === (incoming.variantId ?? null)
          );
          if (existing) {
            existing.quantity += qty;
          } else {
            next.items.push({
              id: incomingId,
              name: incoming.name ?? 'Item',
              price: incoming.price ?? 0,
              quantity: qty,
              variantId: incoming.variantId,
            });
          }
        }
      } else if ('promo' in (vars || {})) {
        // Preserve items, attach promo field optimistically (without altering totals logic here)
        if (next) (next as any).promo = (vars as any).promo;
      }
      if (next) {
        queryClient.setQueryData(['cart'], next);
      }
      return { prev };
    },
    onError: (err: any, vars: any, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(['cart'], data);
      setStoreItems(data);
      Promise.resolve(AsyncStorage.setItem('cart', JSON.stringify(data))).catch(() => {});
    },
  });

  const applyPromo = async (code: string) => {
    const _state = await NetInfo.fetch();
    if (!_state.isConnected) {
      await queueAction({ endpoint: '/cart/apply-coupon', payload: { code } });
      throw new Error('queued');
    }
    const { data } = await phase4Client.post('/cart/apply-coupon', { code });
    const cartPayload = data?.cart ?? data;
    queryClient.setQueryData(['cart'], cartPayload);
    setStoreItems(cartPayload);
    await AsyncStorage.setItem('cart', JSON.stringify(cartPayload));
    return cartPayload;
  };

  return {
    // Return normalized cart with items from store and calculated total
    cart: {
      items: storeItems,
      total: storeItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      ),
      appliedCoupon,
    },
    isLoading: query.isLoading && !loadingFromCache,
    isFetching: query.isFetching,
    error: query.error,
    updateCart: mutation.mutateAsync,
    // convenience helper to send an array of items: { items: [...] }
    addItems: async (items: any[]) => {
      // Always normalize items for backend
      const normalized = items.map(item => ({
        productId: item.productId ?? item.id,
        variantId: item.variantId,
        quantity: item.quantity ?? 1,
        price: item.price,
      }));
      return mutation.mutateAsync({ items: normalized });
    },
    addItem: async (item: any) => {
      const normalized = {
        productId: item.productId ?? item.id,
        variantId: item.variantId,
        quantity: item.quantity ?? 1,
        price: item.price,
      };
      return mutation.mutateAsync({ items: [normalized] });
    },
    applyPromo,
    refetchCart: query.refetch,
    hasPending: pending,
  };
}
