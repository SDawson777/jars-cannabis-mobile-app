// src/api/phase4Client.ts
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clientGet, clientPost } from './http';
import type { CMSProduct } from '../types/cms';

import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';

const BASE_URL = API_BASE_URL;

function createPhase4Client(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }) as AxiosInstance;

  client.interceptors.request.use(
    // Use axios's InternalAxiosRequestConfig here so the interceptor signature
    // matches axios expectations. We still avoid wide `any` usage when touching
    // headers by casting to a record.
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token instanceof Promise) {
        throw new Error('getAuthToken must be synchronous for Axios interceptors');
      }
      if (token) {
        if (!config.headers || Array.isArray(config.headers)) {
          // Axios's headers type is complex; initialize with a plain object and
          // assert via unknown to satisfy the type system.
          config.headers = {} as unknown as typeof config.headers;
        }
        (config.headers as unknown as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  return client;
}

export const phase4Client = createPhase4Client();
export async function getForYou<T = { items: CMSProduct[] }>(storeId?: string): Promise<T> {
  return clientGet<T>(
    phase4Client,
    `/recommendations/for-you${storeId ? `?storeId=${storeId}` : ''}`
  );
}

export async function getRelated<T = { items: CMSProduct[] }>(
  productId: string,
  storeId?: string
): Promise<T> {
  return clientGet<T>(
    phase4Client,
    `/recommendations/related/${productId}${storeId ? `?storeId=${storeId}` : ''}`
  );
}

export async function postReview<T = { id: string }>(
  productId: string,
  payload: { rating: number; text?: string }
) {
  return clientPost<typeof payload, T>(phase4Client, `/products/${productId}/reviews`, payload);
}

export interface LoyaltyStatusShape {
  points: number;
  level?: string;
  tier?: string;
}

export async function getLoyaltyStatus<T = LoyaltyStatusShape>(): Promise<T> {
  return clientGet<T>(phase4Client, '/loyalty/status');
}

export interface LoyaltyBadge {
  id: string;
  name: string;
  description?: string;
}

export async function getLoyaltyBadges<T = LoyaltyBadge[]>(): Promise<T> {
  return clientGet<T>(phase4Client, '/loyalty/badges');
}

export interface AddressShape {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export async function getAddresses<T = AddressShape[]>(): Promise<T> {
  return clientGet<T>(phase4Client, '/addresses');
}

export async function conciergeChat<T = { reply: string }>(payload: {
  message: string;
  history?: any[];
}) {
  return clientPost<typeof payload, T>(phase4Client, '/concierge/chat', payload);
}

export interface JournalEntry {
  id: string;
  productId?: string;
  rating?: number;
  notes?: string;
  tags?: string[];
  createdAt?: string;
}

export async function getJournal<T = JournalEntry[]>(): Promise<T> {
  const data = await clientGet<T>(phase4Client, '/journal/entries');
  return (data as T) ?? ([] as unknown as T);
}

export async function addJournal<T = JournalEntry>(payload: {
  productId: string;
  rating?: number;
  notes?: string;
  tags?: string[];
}) {
  return clientPost<typeof payload, T>(phase4Client, '/journal/entries', payload);
}

export async function updateJournal<T = JournalEntry>(id: string, payload: Partial<JournalEntry>) {
  // Use POST to the update endpoint for consistency with clientPost helper
  return clientPost<Partial<JournalEntry>, T>(phase4Client, `/journal/entries/${id}`, payload);
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

export interface AwardsStatus {
  total?: number;
  available?: number;
}

export async function getAwardsStatus<T = AwardsStatus>(): Promise<T> {
  return clientGet<T>(phase4Client, '/awards/status');
}
