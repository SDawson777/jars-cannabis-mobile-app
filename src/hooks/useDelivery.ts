// src/hooks/useDelivery.ts
// Delivery scheduling, tracking and pickup window management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface DeliveryWindow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
  type: 'express' | 'standard' | 'economy';
  estimatedMinutes?: number;
}

export interface PickupWindow {
  id: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  spotsRemaining?: number;
}

export interface DeliveryEstimate {
  orderId?: string;
  addressId: string;
  estimatedMinutes: number;
  estimatedArrival: string;
  fee: number;
  freeDeliveryThreshold?: number;
  amountToFreeDelivery?: number;
}

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  driver?: {
    name: string;
    phone?: string;
    photoUrl?: string;
    vehicleDescription?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  deliveryAddress?: {
    line1: string;
    city: string;
    state: string;
  };
}

export interface ScheduledDelivery {
  orderId: string;
  windowId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'delivery' | 'pickup';
  storeId?: string;
  storeName?: string;
}

/**
 * Hook to fetch available delivery windows for an address
 */
export function useDeliveryWindows(addressId: string, date?: string) {
  return useQuery<DeliveryWindow[], Error>({
    queryKey: ['delivery', 'windows', addressId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('addressId', addressId);
      if (date) params.append('date', date);

      const res = await clientGet<{ windows: DeliveryWindow[] }>(
        phase4Client,
        `/delivery/windows?${params}`
      );
      return res.windows || [];
    },
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch available pickup windows for a store
 */
export function usePickupWindows(storeId: string, date?: string) {
  return useQuery<PickupWindow[], Error>({
    queryKey: ['pickup', 'windows', storeId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);

      const res = await clientGet<{ windows: PickupWindow[] }>(
        phase4Client,
        `/stores/${storeId}/pickup-windows?${params}`
      );
      return res.windows || [];
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get delivery estimate for an address
 */
export function useDeliveryEstimate(addressId: string, cartTotal?: number) {
  return useQuery<DeliveryEstimate, Error>({
    queryKey: ['delivery', 'estimate', addressId, cartTotal],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('addressId', addressId);
      if (cartTotal !== undefined) params.append('cartTotal', String(cartTotal));

      return clientGet<DeliveryEstimate>(phase4Client, `/delivery/estimate?${params}`);
    },
    enabled: !!addressId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to schedule delivery for an order
 */
export function useScheduleDelivery() {
  const queryClient = useQueryClient();

  return useMutation<ScheduledDelivery, Error, { orderId: string; windowId: string }>({
    mutationFn: async ({ orderId, windowId }: { orderId: string; windowId: string }) => {
      const result = await clientPost<{ orderId: string; windowId: string }, ScheduledDelivery>(
        phase4Client,
        '/delivery/schedule',
        { orderId, windowId }
      );
      logEvent('delivery_scheduled', { orderId, windowId });
      return result;
    },
    onSuccess: (_data: ScheduledDelivery, variables: { orderId: string; windowId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
    },
  });
}

/**
 * Hook to schedule pickup for an order
 */
export function useSchedulePickup() {
  const queryClient = useQueryClient();

  return useMutation<
    ScheduledDelivery,
    Error,
    { orderId: string; storeId: string; windowId: string }
  >({
    mutationFn: async ({
      orderId,
      storeId,
      windowId,
    }: {
      orderId: string;
      storeId: string;
      windowId: string;
    }) => {
      const result = await clientPost<
        { orderId: string; storeId: string; windowId: string },
        ScheduledDelivery
      >(phase4Client, '/pickup/schedule', { orderId, storeId, windowId });
      logEvent('pickup_scheduled', { orderId, storeId, windowId });
      return result;
    },
    onSuccess: (
      _data: ScheduledDelivery,
      variables: { orderId: string; storeId: string; windowId: string }
    ) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['pickup'] });
    },
  });
}

/**
 * Hook to track an order's delivery status
 */
export function useOrderTracking(orderId: string) {
  return useQuery<OrderTracking, Error>({
    queryKey: ['orders', orderId, 'tracking'],
    queryFn: async () => {
      return clientGet<OrderTracking>(phase4Client, `/orders/${orderId}/tracking`);
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - tracking updates frequently
    refetchInterval: 60 * 1000, // Auto-refresh every minute when order is active
  });
}

/**
 * Hook to get live driver location (for active deliveries)
 */
export function useDriverLocation(orderId: string, enabled: boolean = true) {
  return useQuery<
    {
      latitude: number;
      longitude: number;
      heading?: number;
      eta?: string;
      updatedAt: string;
    },
    Error
  >({
    queryKey: ['orders', orderId, 'driver-location'],
    queryFn: async () => {
      return clientGet(phase4Client, `/orders/${orderId}/driver-location`);
    },
    enabled: !!orderId && enabled,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refresh every 15 seconds for live tracking
  });
}

/**
 * Hook to update delivery instructions
 */
export function useUpdateDeliveryInstructions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orderId: string; instructions: string }>({
    mutationFn: async ({ orderId, instructions }: { orderId: string; instructions: string }) => {
      await clientPost<{ instructions: string }, void>(
        phase4Client,
        `/orders/${orderId}/delivery-instructions`,
        { instructions }
      );
    },
    onSuccess: (_data: void, variables: { orderId: string; instructions: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
    },
  });
}

/**
 * Hook to confirm order receipt
 */
export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orderId: string; signature?: string; rating?: number }>({
    mutationFn: async ({
      orderId,
      signature,
      rating,
    }: {
      orderId: string;
      signature?: string;
      rating?: number;
    }) => {
      await clientPost<{ signature?: string; rating?: number }, void>(
        phase4Client,
        `/orders/${orderId}/confirm-delivery`,
        { signature, rating }
      );
      logEvent('delivery_confirmed', { orderId, hasRating: !!rating });
    },
    onSuccess: (
      _data: void,
      variables: { orderId: string; signature?: string; rating?: number }
    ) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
