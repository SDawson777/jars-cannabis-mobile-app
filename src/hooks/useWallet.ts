// src/hooks/useWallet.ts
// In-app wallet for loyalty points, gift cards, digital receipts and tokens
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface WalletBalance {
  loyaltyPoints: number;
  loyaltyValue: number; // Dollar value of points
  giftCardBalance: number;
  storeCredit: number;
  cannabisTokens?: number; // For jurisdictions that allow
  totalValue: number;
  currency: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  originalAmount: number;
  expiresAt?: string;
  purchasedAt: string;
  lastUsedAt?: string;
  isActive: boolean;
  source: 'purchased' | 'received' | 'reward' | 'refund';
  senderName?: string;
  message?: string;
}

export interface DigitalReceipt {
  id: string;
  orderId: string;
  orderNumber: string;
  storeName: string;
  storeAddress: string;
  purchaseDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  tip?: number;
  total: number;
  paymentMethod: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    thcPercent?: number;
    batchNumber?: string;
  }[];
  loyaltyPointsEarned?: number;
  pdfUrl?: string;
  warrantyInfo?: {
    productId: string;
    warrantyEndDate: string;
    warrantyType: string;
  }[];
}

export interface WalletTransaction {
  id: string;
  type:
    | 'points_earn'
    | 'points_redeem'
    | 'gift_card_add'
    | 'gift_card_use'
    | 'credit_add'
    | 'credit_use'
    | 'token_earn'
    | 'token_use';
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface StoreCredit {
  id: string;
  amount: number;
  reason: 'return' | 'refund' | 'compensation' | 'promo';
  expiresAt?: string;
  createdAt: string;
  usedAt?: string;
  orderId?: string;
}

/**
 * Hook to fetch wallet balance summary
 */
export function useWalletBalance() {
  return useQuery<WalletBalance, Error>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      return clientGet<WalletBalance>(phase4Client, '/wallet/balance');
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch gift cards
 */
export function useGiftCards() {
  return useQuery<GiftCard[], Error>({
    queryKey: ['wallet', 'gift-cards'],
    queryFn: async () => {
      const res = await clientGet<{ giftCards: GiftCard[] }>(phase4Client, '/wallet/gift-cards');
      return res.giftCards || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to add a gift card to wallet
 */
export function useAddGiftCard() {
  const queryClient = useQueryClient();

  return useMutation<GiftCard, Error, { code: string; pin?: string }>({
    mutationFn: async ({ code, pin }: { code: string; pin?: string }) => {
      const result = await clientPost<{ code: string; pin?: string }, GiftCard>(
        phase4Client,
        '/wallet/gift-cards/add',
        { code, pin }
      );
      logEvent('gift_card_added', { amount: result.balance });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

/**
 * Hook to check gift card balance (without adding)
 */
export function useCheckGiftCardBalance() {
  return useMutation<
    { balance: number; expiresAt?: string },
    Error,
    { code: string; pin?: string }
  >({
    mutationFn: async ({ code, pin }: { code: string; pin?: string }) => {
      return clientPost(phase4Client, '/wallet/gift-cards/check-balance', { code, pin });
    },
  });
}

/**
 * Hook to purchase a gift card
 */
export function usePurchaseGiftCard() {
  const queryClient = useQueryClient();

  return useMutation<
    { giftCard: GiftCard; orderId: string },
    Error,
    {
      amount: number;
      recipientEmail?: string;
      recipientName?: string;
      message?: string;
      sendDate?: string;
    }
  >({
    mutationFn: async (payload: {
      amount: number;
      recipientEmail?: string;
      recipientName?: string;
      message?: string;
      sendDate?: string;
    }) => {
      const result = await clientPost<typeof payload, { giftCard: GiftCard; orderId: string }>(
        phase4Client,
        '/wallet/gift-cards/purchase',
        payload
      );
      logEvent('gift_card_purchased', { amount: payload.amount, isGift: !!payload.recipientEmail });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook to fetch digital receipts
 */
export function useDigitalReceipts() {
  return useInfiniteQuery<
    { receipts: DigitalReceipt[]; hasMore: boolean; nextCursor?: string },
    Error
  >({
    queryKey: ['wallet', 'receipts'],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = pageParam ? `?cursor=${pageParam}` : '';
      return clientGet(phase4Client, `/wallet/receipts${params}`);
    },
    getNextPageParam: (lastPage: {
      receipts: DigitalReceipt[];
      hasMore: boolean;
      nextCursor?: string;
    }) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single receipt
 */
export function useDigitalReceipt(receiptId: string) {
  return useQuery<DigitalReceipt, Error>({
    queryKey: ['wallet', 'receipts', receiptId],
    queryFn: async () => {
      return clientGet<DigitalReceipt>(phase4Client, `/wallet/receipts/${receiptId}`);
    },
    enabled: !!receiptId,
  });
}

/**
 * Hook to email a receipt
 */
export function useEmailReceipt() {
  return useMutation<void, Error, { receiptId: string; email: string }>({
    mutationFn: async ({ receiptId, email }: { receiptId: string; email: string }) => {
      await clientPost<{ email: string }, void>(
        phase4Client,
        `/wallet/receipts/${receiptId}/email`,
        { email }
      );
      logEvent('receipt_emailed', { receiptId });
    },
  });
}

/**
 * Hook to fetch wallet transaction history
 */
export function useWalletTransactions(type?: WalletTransaction['type']) {
  return useInfiniteQuery<
    { transactions: WalletTransaction[]; hasMore: boolean; nextCursor?: string },
    Error
  >({
    queryKey: ['wallet', 'transactions', type],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (pageParam) params.append('cursor', pageParam);
      params.append('limit', '20');

      return clientGet(phase4Client, `/wallet/transactions?${params}`);
    },
    getNextPageParam: (lastPage: {
      transactions: WalletTransaction[];
      hasMore: boolean;
      nextCursor?: string;
    }) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch store credits
 */
export function useStoreCredits() {
  return useQuery<StoreCredit[], Error>({
    queryKey: ['wallet', 'store-credits'],
    queryFn: async () => {
      const res = await clientGet<{ credits: StoreCredit[] }>(
        phase4Client,
        '/wallet/store-credits'
      );
      return res.credits || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to apply wallet balance at checkout
 */
export function useApplyWalletAtCheckout() {
  return useMutation<
    { appliedAmount: number; remainingTotal: number },
    Error,
    {
      orderId: string;
      usePoints?: boolean;
      useGiftCards?: boolean;
      useStoreCredit?: boolean;
      maxAmount?: number;
    }
  >({
    mutationFn: async (payload: {
      orderId: string;
      usePoints?: boolean;
      useGiftCards?: boolean;
      useStoreCredit?: boolean;
      maxAmount?: number;
    }) => {
      const result = await clientPost<
        typeof payload,
        { appliedAmount: number; remainingTotal: number }
      >(phase4Client, '/checkout/apply-wallet', payload);
      logEvent('wallet_applied_checkout', {
        appliedAmount: result.appliedAmount,
        usePoints: payload.usePoints,
        useGiftCards: payload.useGiftCards,
      });
      return result;
    },
  });
}

/**
 * Hook to get warranty info for purchased products
 */
export function useWarrantyInfo(productId: string) {
  return useQuery<
    {
      hasWarranty: boolean;
      warrantyEndDate?: string;
      warrantyType?: string;
      receiptId?: string;
      purchaseDate?: string;
    },
    Error
  >({
    queryKey: ['wallet', 'warranty', productId],
    queryFn: async () => {
      return clientGet(phase4Client, `/wallet/warranty/${productId}`);
    },
    enabled: !!productId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
