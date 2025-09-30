// src/api/phase4Client.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { clientGet, clientPost } from './http';

import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';

const BASE_URL = API_BASE_URL;

function createPhase4Client(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }) as AxiosInstance;

  client.interceptors.request.use(
    // Keep interceptor parameter permissive to avoid tight coupling with axios internals
    (config: any) => {
      const token = (getAuthToken as any)();
      if (token instanceof Promise) {
        throw new Error('getAuthToken must be synchronous for Axios interceptors');
      }
      if (token) {
        if (!config.headers || Array.isArray(config.headers)) {
          config.headers = {};
        }
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  return client;
}

export const phase4Client = createPhase4Client();
export async function getForYou<T = any>(storeId?: string): Promise<T> {
  return clientGet<T>(
    phase4Client,
    `/recommendations/for-you${storeId ? `?storeId=${storeId}` : ''}`
  );
}

export async function getRelated<T = any>(productId: string, storeId?: string): Promise<T> {
  return clientGet<T>(
    phase4Client,
    `/recommendations/related/${productId}${storeId ? `?storeId=${storeId}` : ''}`
  );
}

export async function postReview(productId: string, payload: { rating: number; text?: string }) {
  return clientPost(phase4Client, `/products/${productId}/reviews`, payload);
}

export async function getLoyaltyStatus<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/loyalty/status');
}

export async function getLoyaltyBadges<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/loyalty/badges');
}

export async function getAddresses<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/addresses');
}

export async function conciergeChat<T = any>(payload: { message: string; history?: any[] }) {
  return clientPost<typeof payload, T>(phase4Client, '/concierge/chat', payload);
}

export async function getJournal<T = any[]>(): Promise<T> {
  const data = await clientGet<T>(phase4Client, '/journal/entries');
  return (data as T) ?? ([] as unknown as T);
}

export async function addJournal<T = any>(payload: {
  productId: string;
  rating?: number;
  notes?: string;
  tags?: string[];
}) {
  return clientPost<typeof payload, T>(phase4Client, '/journal/entries', payload);
}

export async function updateJournal<T = any>(id: string, payload: any) {
  // axios put generics: put<TRes, T = any>(url, data?) — use clientPost helper for consistency
  return clientPost<any, T>(phase4Client, `/journal/entries/${id}`, payload);
}

export async function getPrefs<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/profile/preferences');
}

export async function updatePrefs<T = any>(payload: any) {
  return clientPost<any, T>(phase4Client, '/profile/preferences', payload);
}

// Data privacy preferences (separate from accessibility prefs)
export async function getDataPrefs<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/profile/data-preferences');
}

export async function updateDataPrefs<T = any>(payload: any) {
  return clientPost<any, T>(phase4Client, '/profile/data-preferences', payload);
}

export async function getAwardsStatus<T = any>(): Promise<T> {
  return clientGet<T>(phase4Client, '/awards/status');
}
