// src/api/stripe.ts
import { Platform } from 'react-native';

import { API_BASE_URL } from '../utils/apiConfig';
import { fetchJson } from '../utils/apiClient';

const API_URL = API_BASE_URL;

export interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export async function fetchPaymentSheetParams(): Promise<PaymentSheetParams> {
  return fetchJson<PaymentSheetParams>(`${API_URL}/stripe/payment-sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: Platform.OS }),
    retries: 2,
  });
}
