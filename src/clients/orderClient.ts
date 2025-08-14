import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '../utils/auth';
import type { OrdersResponse } from '../types/order';
import { API_BASE_URL } from '../utils/apiConfig';

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
