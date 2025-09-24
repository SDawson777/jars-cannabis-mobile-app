import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import type { OrdersResponse, Order } from '../types/order';
import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';

const BASE_URL = API_BASE_URL;

function createOrderClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' } as any,
  });

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAuthToken();
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return client;
}

export const orderClient = createOrderClient();

export async function fetchOrders(page = 1): Promise<OrdersResponse> {
  const res = await orderClient.get('/orders', { params: { page } });
  // Backend returns { orders, pagination: { page, limit, nextPage } }
  // Normalize to OrdersResponse: { orders, nextPage }
  const d: any = res.data ?? {};
  const orders = d.orders ?? d.data?.orders ?? [];
  const nextPage = d.pagination?.nextPage ?? d.data?.pagination?.nextPage ?? undefined;
  return { orders, nextPage };
}

// Payload contract for creating an order. This mirrors backend expectations in
// backend/src/routes/orders.ts (storeId required unless cart contains one; if
// deliveryMethod === 'delivery' deliveryAddress.{city,state,zipCode} required.)
export interface CreateOrderPayload {
  storeId?: string; // allow backend inference when omitted
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  contact: { name: string; phone: string; email: string };
  paymentMethod: 'card' | 'pay_at_pickup';
  notes?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await orderClient.post('/orders', payload);
  // API responds with { order }
  return (res.data?.order || res.data?.data?.order) as Order;
}
