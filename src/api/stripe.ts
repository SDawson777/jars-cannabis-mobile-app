// src/api/stripe.ts
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export async function fetchPaymentSheetParams(): Promise<PaymentSheetParams> {
  const res = await fetch(`${API_URL}/stripe/payment-sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: Platform.OS }),
  });

  if (!res.ok) {
    throw new Error('Failed to load payment parameters');
  }

  return res.json();
}
