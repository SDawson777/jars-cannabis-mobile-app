// src/api/phase4Client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/apiConfig';

const BASE_URL = API_BASE_URL;

function createPhase4Client(): AxiosInstance {
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

export const phase4Client = createPhase4Client();

export async function getForYou(storeId?: string) {
  const res = await phase4Client.get(
    `/recommendations/for-you${storeId ? `?storeId=${storeId}` : ''}`
  );
  return res.data;
}

export async function getRelated(productId: string, storeId?: string) {
  const res = await phase4Client.get(
    `/recommendations/related/${productId}${storeId ? `?storeId=${storeId}` : ''}`
  );
  return res.data;
}

export async function postReview(productId: string, payload: { rating: number; text?: string }) {
  const res = await phase4Client.post(`/products/${productId}/reviews`, payload);
  return res.data;
}

export async function getLoyaltyStatus() {
  const res = await phase4Client.get('/loyalty/status');
  return res.data;
}

export async function getLoyaltyBadges() {
  const res = await phase4Client.get('/loyalty/badges');
  return res.data;
}

export async function conciergeChat(payload: { message: string; history?: any[] }) {
  const res = await phase4Client.post('/concierge/chat', payload);
  return res.data;
}

export async function getJournal() {
  const res = await phase4Client.get('/journal/entries');
  return res.data;
}

export async function addJournal(payload: {
  productId: string;
  rating?: number;
  notes?: string;
  tags?: string[];
}) {
  const res = await phase4Client.post('/journal/entries', payload);
  return res.data;
}

export async function updateJournal(id: string, payload: any) {
  const res = await phase4Client.put(`/journal/entries/${id}`, payload);
  return res.data;
}

export async function getPrefs() {
  const res = await phase4Client.get('/profile/preferences');
  return res.data;
}

export async function updatePrefs(payload: any) {
  const res = await phase4Client.put('/profile/preferences', payload);
  return res.data;
}

export async function getAwardsStatus() {
  const res = await phase4Client.get('/awards/status');
  return res.data;
}

export async function getStash() {
  const res = await phase4Client.get('/stash');
  return res.data;
}
