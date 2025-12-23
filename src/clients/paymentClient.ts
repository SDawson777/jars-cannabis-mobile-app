import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';
import { fetchJson } from '../utils/apiClient';

const BASE_URL = API_BASE_URL;

export interface PaymentPayload {
  // tokenized metadata from payment processor
  cardBrand: string;
  cardLast4: string;
  holderName?: string;
  expiry?: string; // MM/YY
  isDefault?: boolean;
}

// eslint-disable-next-line no-undef
async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetchJson(`${BASE_URL}${path}`, { ...options, headers } as any);
}

export async function addPaymentMethod(payload: PaymentPayload) {
  return authFetch('/payment-methods', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePaymentMethod(id: string, payload: PaymentPayload) {
  return authFetch(`/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getPaymentMethods() {
  return authFetch('/payment-methods', { method: 'GET' });
}
