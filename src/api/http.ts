import axios, { AxiosRequestConfig } from 'axios';
import type { AxiosInstance } from 'axios';

import { API_BASE_URL } from '../utils/apiConfig';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function getJSON<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function postJSON<TReq, TRes>(
  url: string,
  data?: TReq,
  config?: AxiosRequestConfig
): Promise<TRes> {
  const res = await api.post<TRes>(url, data as any, config);
  return res.data;
}

// Generic helpers that operate against any AxiosInstance. Prefer these in client modules
// so call sites don't access `res.data` directly and can benefit from consistent typing.
export async function clientGet<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.get<T>(url, config);
  return res.data;
}

export async function clientPost<TReq, TRes>(
  client: AxiosInstance,
  url: string,
  data?: TReq,
  config?: AxiosRequestConfig
): Promise<TRes> {
  const res = await client.post<TRes>(url, data as any, config);
  return res.data;
}

export default api;
