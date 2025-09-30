import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createOrder, CreateOrderPayload, fetchOrders } from '../clients/orderClient';
import type { Order } from '../types/order';

// Keys
const ordersKey = ['orders'];
const orderKey = (id: string) => ['orders', id];

export function useCreateOrder(options?: {
  onSuccess?: (order: Order) => void;
  onError?: (err: any) => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation<Order, any, CreateOrderPayload>({
    mutationFn: createOrder,
    onSuccess: (order: Order, _vars: any, _ctx: any) => {
      // Optimistically prime individual order cache & invalidate list
      qc.setQueryData(orderKey(order.id), order);
      qc.invalidateQueries({ queryKey: ordersKey }).catch(() => {});
      options?.onSuccess?.(order);
    },
    onError: (err: any) => {
      options?.onError?.(err);
    },
  });
  return mutation;
}

export function useOrder(orderId: string, enabled = true) {
  return useQuery<Order | undefined>({
    queryKey: orderKey(orderId),
    queryFn: async () => {
      // We currently only fetch full lists; for simplicity re-use fetchOrders and find
      const { orders } = await fetchOrders(1);
      return orders.find(o => o.id === orderId);
    },
    enabled: !!orderId && enabled,
  });
}
