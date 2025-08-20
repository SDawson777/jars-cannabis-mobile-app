import { API_BASE_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/auth';

const BASE_URL = API_BASE_URL;

export interface PaymentPayload {
  cardNumber: string;
  name: string;
  expiry: string;
  cvv: string;
}

async function authFetch(path: string, options: RequestInit) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error('Request failed');
  }
  return res.json();
}

export async function addPaymentMethod(payload: PaymentPayload) {
  return authFetch('/payment-methods', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePaymentMethod(id: string, payload: PaymentPayload) {
  return authFetch(`/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
