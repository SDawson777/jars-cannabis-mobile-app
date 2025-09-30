import axios, { AxiosRequestConfig } from 'axios';

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

export default api;
