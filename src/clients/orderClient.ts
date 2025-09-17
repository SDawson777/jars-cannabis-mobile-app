import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import type { Order, OrdersResponse } from '../types/order';
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
  const res = await orderClient.get<OrdersResponse>('/orders', { params: { page } });
  return res.data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await orderClient.get<Order>(`/orders/${id}`);
  return res.data;
}
