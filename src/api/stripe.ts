// src/api/stripe.ts
import { Platform } from 'react-native';

import { API_BASE_URL } from '../utils/apiConfig';

const API_URL = API_BASE_URL;

export interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export async function fetchPaymentSheetParams(): Promise<PaymentSheetParams> {
  const res = await fetch(`${API_URL}/api/v1/stripe/payment-sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: Platform.OS }),
  });

  if (!res.ok) {
    throw new Error('Failed to load payment parameters');
  }

  return res.json();
}
