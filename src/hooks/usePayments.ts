// src/hooks/usePayments.ts
// Cannabis-compliant payment processor integration hooks
// Supports Hypur, Dutchie Pay, and other compliant processors

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export type PaymentProcessor =
  | 'hypur'
  | 'dutchie_pay'
  | 'aeropay'
  | 'canpay'
  | 'paytender'
  | 'merrco';

export type PaymentMethodType = 'bank_account' | 'debit_card' | 'ach' | 'cash' | 'credit';

export interface PaymentMethod {
  id: string;
  processor: PaymentProcessor;
  type: PaymentMethodType;
  last4: string;
  bankName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  nickname?: string;
  createdAt: string;
}

export interface PaymentProcessorConfig {
  processor: PaymentProcessor;
  name: string;
  displayName: string;
  isEnabled: boolean;
  isConfigured: boolean;
  supportedMethods: PaymentMethodType[];
  fees: {
    percentage: number;
    flatFee: number;
    minFee?: number;
    maxFee?: number;
  };
  features: {
    supportsRefunds: boolean;
    supportsPartialRefunds: boolean;
    supportsRecurring: boolean;
    supportsTips: boolean;
  };
  logoUrl?: string;
  setupUrl?: string;
}

export interface PaymentIntent {
  id: string;
  processor: PaymentProcessor;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'requires_action';
  orderId?: string;
  paymentMethodId?: string;
  clientSecret?: string; // For client-side confirmation
  redirectUrl?: string; // For 3DS or bank redirect
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  transactionId?: string;
  status: PaymentIntent['status'];
  error?: {
    code: string;
    message: string;
    declineCode?: string;
  };
  receipt?: {
    url: string;
    number: string;
  };
}

export interface POSTransaction {
  id: string;
  type: 'sale' | 'refund' | 'void';
  amount: number;
  tip?: number;
  tax?: number;
  status: 'pending' | 'completed' | 'failed' | 'voided';
  paymentMethod: PaymentMethodType;
  terminalId?: string;
  employeeId?: string;
  orderId?: string;
  customerId?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface POSTerminal {
  id: string;
  name: string;
  storeId: string;
  type: 'integrated' | 'standalone';
  status: 'online' | 'offline' | 'busy';
  lastSeen: string;
  capabilities: string[];
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // For partial refunds
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'product_issue' | 'other';
  notes?: string;
}

export interface Tip {
  amount: number;
  percentage?: number;
  recipient?: 'store' | 'driver' | 'budtender';
}

// ============================================
// Payment Processor Configuration Hooks
// ============================================

/**
 * Hook to fetch available payment processors
 */
export function usePaymentProcessors() {
  return useQuery<PaymentProcessorConfig[], Error>({
    queryKey: ['payments', 'processors'],
    queryFn: async () => {
      const res = await clientGet<{ processors: PaymentProcessorConfig[] }>(
        phase4Client,
        '/payments/processors'
      );
      return res.processors;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to check if a specific processor is configured
 */
export function useProcessorStatus(processor: PaymentProcessor) {
  return useQuery<PaymentProcessorConfig, Error>({
    queryKey: ['payments', 'processors', processor],
    queryFn: async () => {
      return await clientGet<PaymentProcessorConfig>(
        phase4Client,
        `/payments/processors/${processor}`
      );
    },
    enabled: !!processor,
  });
}

// ============================================
// Payment Methods Hooks
// ============================================

/**
 * Hook to fetch user's saved payment methods
 */
export function usePaymentMethods() {
  return useQuery<PaymentMethod[], Error>({
    queryKey: ['payments', 'methods'],
    queryFn: async () => {
      const res = await clientGet<{ methods: PaymentMethod[] }>(phase4Client, '/payments/methods');
      return res.methods;
    },
  });
}

/**
 * Hook to add a new payment method
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentMethod,
    Error,
    {
      processor: PaymentProcessor;
      type: PaymentMethodType;
      token?: string; // Tokenized payment info from processor SDK
      bankAccountNumber?: string; // For ACH (should be tokenized in production)
      routingNumber?: string;
      nickname?: string;
      setAsDefault?: boolean;
    }
  >({
    mutationFn: async (params: {
      processor: PaymentProcessor;
      type: PaymentMethodType;
      token?: string;
      bankAccountNumber?: string;
      routingNumber?: string;
      nickname?: string;
      setAsDefault?: boolean;
    }) => {
      const result = await clientPost<typeof params, PaymentMethod>(
        phase4Client,
        '/payments/methods',
        params
      );
      logEvent('payment_method_added', {
        processor: params.processor,
        type: params.type,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'methods'] });
    },
  });
}

/**
 * Hook to remove a payment method
 */
export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (methodId: string) => {
      await clientDelete(phase4Client, `/payments/methods/${methodId}`);
      logEvent('payment_method_removed', { methodId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'methods'] });
    },
  });
}

/**
 * Hook to set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<PaymentMethod, Error, string>({
    mutationFn: async (methodId: string) => {
      return await clientPost<{ methodId: string }, PaymentMethod>(
        phase4Client,
        '/payments/methods/default',
        { methodId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'methods'] });
    },
  });
}

// ============================================
// Payment Processing Hooks
// ============================================

/**
 * Hook to create a payment intent
 */
export function useCreatePaymentIntent() {
  return useMutation<
    PaymentIntent,
    Error,
    {
      amount: number;
      currency?: string;
      orderId?: string;
      paymentMethodId?: string;
      processor?: PaymentProcessor;
      metadata?: Record<string, string>;
    }
  >({
    mutationFn: async (params: {
      amount: number;
      currency?: string;
      orderId?: string;
      paymentMethodId?: string;
      processor?: PaymentProcessor;
      metadata?: Record<string, string>;
    }) => {
      const result = await clientPost<typeof params, PaymentIntent>(
        phase4Client,
        '/payments/intents',
        { ...params, currency: params.currency || 'USD' }
      );
      logEvent('payment_intent_created', {
        amount: params.amount,
        processor: params.processor,
      });
      return result;
    },
  });
}

/**
 * Hook to confirm/process a payment
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentResult,
    Error,
    {
      paymentIntentId: string;
      paymentMethodId?: string;
      tip?: Tip;
      saveMethod?: boolean;
    }
  >({
    mutationFn: async (params: {
      paymentIntentId: string;
      paymentMethodId?: string;
      tip?: Tip;
      saveMethod?: boolean;
    }) => {
      const result = await clientPost<typeof params, PaymentResult>(
        phase4Client,
        `/payments/intents/${params.paymentIntentId}/confirm`,
        params
      );
      logEvent('payment_confirmed', {
        paymentIntentId: params.paymentIntentId,
        success: result.success,
      });
      return result;
    },
    onSuccess: (result: PaymentResult) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}

/**
 * Hook to cancel a payment intent
 */
export function useCancelPayment() {
  return useMutation<void, Error, string>({
    mutationFn: async (paymentIntentId: string) => {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/payments/intents/${paymentIntentId}/cancel`,
        {}
      );
      logEvent('payment_cancelled', { paymentIntentId });
    },
  });
}

/**
 * Hook to check payment status
 */
export function usePaymentStatus(paymentIntentId: string) {
  return useQuery<PaymentIntent, Error>({
    queryKey: ['payments', 'intents', paymentIntentId],
    queryFn: async () => {
      return await clientGet<PaymentIntent>(phase4Client, `/payments/intents/${paymentIntentId}`);
    },
    enabled: !!paymentIntentId,
    refetchInterval: (query: { state: { data?: PaymentIntent } }) => {
      const data = query.state.data;
      // Poll while pending or processing
      if (data && ['pending', 'processing', 'requires_action'].includes(data.status)) {
        return 2000;
      }
      return false;
    },
  });
}

// ============================================
// Refund Hooks
// ============================================

/**
 * Hook to request a refund
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation<PaymentResult, Error, RefundRequest>({
    mutationFn: async (request: RefundRequest) => {
      const result = await clientPost<RefundRequest, PaymentResult>(
        phase4Client,
        '/payments/refunds',
        request
      );
      logEvent('refund_requested', {
        paymentIntentId: request.paymentIntentId,
        amount: request.amount,
        reason: request.reason,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// ============================================
// POS Integration Hooks
// ============================================

/**
 * Hook to fetch POS terminals for a store
 */
export function usePOSTerminals(storeId: string) {
  return useQuery<POSTerminal[], Error>({
    queryKey: ['pos', 'terminals', storeId],
    queryFn: async () => {
      const res = await clientGet<{ terminals: POSTerminal[] }>(phase4Client, `/pos/terminals`, {
        params: { storeId },
      });
      return res.terminals;
    },
    enabled: !!storeId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to initiate a POS transaction
 */
export function useInitiatePOSTransaction() {
  return useMutation<
    POSTransaction,
    Error,
    {
      terminalId: string;
      amount: number;
      tip?: number;
      orderId?: string;
      paymentMethod: PaymentMethodType;
    }
  >({
    mutationFn: async (params: {
      terminalId: string;
      amount: number;
      tip?: number;
      orderId?: string;
      paymentMethod: PaymentMethodType;
    }) => {
      const result = await clientPost<typeof params, POSTransaction>(
        phase4Client,
        '/pos/transactions',
        params
      );
      logEvent('pos_transaction_initiated', {
        terminalId: params.terminalId,
        amount: params.amount,
      });
      return result;
    },
  });
}

/**
 * Hook to check POS transaction status
 */
export function usePOSTransactionStatus(transactionId: string) {
  return useQuery<POSTransaction, Error>({
    queryKey: ['pos', 'transactions', transactionId],
    queryFn: async () => {
      return await clientGet<POSTransaction>(phase4Client, `/pos/transactions/${transactionId}`);
    },
    enabled: !!transactionId,
    refetchInterval: (query: { state: { data?: POSTransaction } }) => {
      const data = query.state.data;
      if (data && data.status === 'pending') {
        return 2000;
      }
      return false;
    },
  });
}

// ============================================
// Tip Calculation Hooks
// ============================================

/**
 * Hook for tip calculation and selection
 */
export function useTipCalculator(subtotal: number) {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const tipPresets = [
    { percentage: 15, label: '15%' },
    { percentage: 18, label: '18%' },
    { percentage: 20, label: '20%' },
    { percentage: 25, label: '25%' },
  ];

  const calculateTip = useCallback(
    (percentage: number): number => {
      return Math.round(subtotal * (percentage / 100) * 100) / 100;
    },
    [subtotal]
  );

  const selectPreset = useCallback(
    (percentage: number, recipient?: Tip['recipient']) => {
      setSelectedTip({
        amount: calculateTip(percentage),
        percentage,
        recipient,
      });
    },
    [calculateTip]
  );

  const setCustomTip = useCallback((amount: number, recipient?: Tip['recipient']) => {
    setSelectedTip({
      amount,
      recipient,
    });
  }, []);

  const clearTip = useCallback(() => {
    setSelectedTip(null);
  }, []);

  return {
    tipPresets,
    selectedTip,
    calculateTip,
    selectPreset,
    setCustomTip,
    clearTip,
  };
}

// ============================================
// Payment Flow Hook
// ============================================

/**
 * Comprehensive hook for managing the entire payment flow
 */
export function usePaymentFlow() {
  const [step, setStep] = useState<
    'select_method' | 'processing' | 'confirm' | 'complete' | 'error'
  >('select_method');
  const [currentIntent, setCurrentIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  const startPayment = useCallback(
    async (params: Parameters<typeof createIntent.mutateAsync>[0]) => {
      setStep('processing');
      setError(null);

      try {
        const intent = await createIntent.mutateAsync(params);
        setCurrentIntent(intent);

        if (intent.status === 'requires_action' && intent.redirectUrl) {
          // Handle 3DS or bank redirect
          setStep('confirm');
        } else if (intent.status === 'succeeded') {
          setStep('complete');
        } else {
          setStep('confirm');
        }

        return intent;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment failed');
        setStep('error');
        throw err;
      }
    },
    [createIntent]
  );

  const completePayment = useCallback(
    async (params: Parameters<typeof confirmPayment.mutateAsync>[0]) => {
      setStep('processing');

      try {
        const result = await confirmPayment.mutateAsync(params);

        if (result.success) {
          setStep('complete');
        } else {
          setError(result.error?.message || 'Payment failed');
          setStep('error');
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment failed');
        setStep('error');
        throw err;
      }
    },
    [confirmPayment]
  );

  const reset = useCallback(() => {
    setStep('select_method');
    setCurrentIntent(null);
    setError(null);
  }, []);

  return {
    step,
    currentIntent,
    error,
    isProcessing: step === 'processing',
    startPayment,
    completePayment,
    reset,
  };
}
