import axios from 'axios';
import { clientGet, clientPost } from '../api/http';

import type { OrdersResponse, Order } from '../types/order';
import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';

const BASE_URL = API_BASE_URL;

function createOrderClient(): ReturnType<typeof axios.create> {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    async (config: any) => {
      const token: string | null = await getAuthToken();
      // ensure headers exists and merge Authorization without assuming specific header types
      config = config || {};
      config.headers = {
        ...(config.headers as Record<string, any> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      return config;
    },
    (error: unknown) => Promise.reject(error)
  );

  return client;
}

export const orderClient = createOrderClient();

export async function fetchOrders(page = 1): Promise<OrdersResponse> {
  interface RawOrdersResponse {
    orders?: Order[];
    pagination?: { page?: number; limit?: number; nextPage?: number };
    data?: {
      orders?: Order[];
      pagination?: { page?: number; limit?: number; nextPage?: number };
    };
  }
  const payload = await clientGet<RawOrdersResponse>(orderClient, '/orders', { params: { page } });
  const root = payload.data ?? payload;
  return {
    orders: root.orders ?? [],
    nextPage: root.pagination?.nextPage,
  };
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
  interface RawCreateOrderResponse {
    order?: Order;
    data?: { order?: Order };
  }
  const res = await clientPost<CreateOrderPayload, RawCreateOrderResponse>(
    orderClient,
    '/orders',
    payload
  );
  return res.order ?? (res.data?.order as Order);
}
