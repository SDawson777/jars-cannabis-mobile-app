// src/hooks/useInventory.ts
// Real-time product availability and inventory management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface InventoryStatus {
  productId: string;
  storeId: string;
  quantity: number;
  available: boolean;
  lowStock: boolean;
  reservedQuantity?: number;
  lastUpdated: string;
}

export interface StoreAvailability {
  storeId: string;
  storeName: string;
  address: string;
  distance?: number;
  available: boolean;
  quantity: number;
  lowStock: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
}

export interface PurchaseLimit {
  productId?: string;
  category?: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDaily: number;
  currentMonthly: number;
  remainingDaily: number;
  remainingMonthly: number;
  state: string;
}

export interface BackInStockSubscription {
  id: string;
  productId: string;
  productName?: string;
  storeId?: string;
  createdAt: string;
  notified?: boolean;
}

/**
 * Hook to check real-time inventory for a product at a specific store
 */
export function useProductInventory(productId: string, storeId?: string) {
  return useQuery<InventoryStatus, Error>({
    queryKey: ['inventory', productId, storeId],
    queryFn: async () => {
      const params = storeId ? `?storeId=${storeId}` : '';
      return clientGet<InventoryStatus>(phase4Client, `/inventory/${productId}${params}`);
    },
    enabled: !!productId,
    staleTime: 30 * 1000, // 30 seconds - inventory changes frequently
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

/**
 * Hook to check product availability across multiple stores
 */
export function useProductAvailabilityByStore(
  productId: string,
  latitude?: number,
  longitude?: number
) {
  return useQuery<StoreAvailability[], Error>({
    queryKey: ['availability', productId, latitude, longitude],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (latitude && longitude) {
        params.append('lat', String(latitude));
        params.append('lng', String(longitude));
      }
      const url = `/inventory/${productId}/stores${params.toString() ? `?${params}` : ''}`;
      const res = await clientGet<{ stores: StoreAvailability[] }>(phase4Client, url);
      return res.stores || [];
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get user's purchasing limits based on state regulations
 */
export function usePurchaseLimits(state?: string) {
  return useQuery<PurchaseLimit[], Error>({
    queryKey: ['purchaseLimits', state],
    queryFn: async () => {
      const params = state ? `?state=${state}` : '';
      const res = await clientGet<{ limits: PurchaseLimit[] }>(
        phase4Client,
        `/compliance/purchase-limits${params}`
      );
      return res.limits || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if adding a product would exceed purchase limits
 */
export function useCheckPurchaseLimit() {
  return useMutation<
    { allowed: boolean; reason?: string; remaining?: number },
    Error,
    { productId: string; quantity: number; storeId?: string }
  >({
    mutationFn: async ({
      productId,
      quantity,
      storeId,
    }: {
      productId: string;
      quantity: number;
      storeId?: string;
    }) => {
      return clientPost(phase4Client, '/compliance/check-limit', { productId, quantity, storeId });
    },
  });
}

/**
 * Hook to subscribe for back-in-stock notifications
 */
export function useBackInStockSubscriptions() {
  return useQuery<BackInStockSubscription[], Error>({
    queryKey: ['backInStock', 'subscriptions'],
    queryFn: async () => {
      const res = await clientGet<{ subscriptions: BackInStockSubscription[] }>(
        phase4Client,
        '/inventory/back-in-stock'
      );
      return res.subscriptions || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to subscribe to back-in-stock notification for a product
 */
export function useSubscribeBackInStock() {
  const queryClient = useQueryClient();

  return useMutation<BackInStockSubscription, Error, { productId: string; storeId?: string }>({
    mutationFn: async ({ productId, storeId }: { productId: string; storeId?: string }) => {
      const result = await clientPost<
        { productId: string; storeId?: string },
        BackInStockSubscription
      >(phase4Client, '/inventory/back-in-stock/subscribe', { productId, storeId });
      logEvent('back_in_stock_subscribed', { productId, storeId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backInStock'] });
    },
  });
}

/**
 * Hook to unsubscribe from back-in-stock notification
 */
export function useUnsubscribeBackInStock() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (subscriptionId: string) => {
      await clientPost<object, void>(
        phase4Client,
        `/inventory/back-in-stock/${subscriptionId}/unsubscribe`,
        {}
      );
      logEvent('back_in_stock_unsubscribed', { subscriptionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backInStock'] });
    },
  });
}

/**
 * Hook to reserve inventory (for cart items)
 */
export function useReserveInventory() {
  return useMutation<
    { reservationId: string; expiresAt: string },
    Error,
    { productId: string; quantity: number; storeId: string }
  >({
    mutationFn: async ({
      productId,
      quantity,
      storeId,
    }: {
      productId: string;
      quantity: number;
      storeId: string;
    }) => {
      return clientPost(phase4Client, '/inventory/reserve', { productId, quantity, storeId });
    },
  });
}
