// src/hooks/useCompliance.ts
// Hooks for compliance alerts and product recall notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../utils/analytics';

export interface RecallNotice {
  id: string;
  productId: string;
  productName: string;
  batchNumbers?: string[];
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  instructions: string;
  issuedAt: string;
  expiresAt?: string;
  affectedStates?: string[];
  contactInfo?: string;
  acknowledged?: boolean;
}

export interface ComplianceAlert {
  id: string;
  type: 'age_verification' | 'state_restriction' | 'purchase_limit' | 'general';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  actionRequired?: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ComplianceStatus {
  ageVerified: boolean;
  ageVerifiedAt?: string;
  state?: string;
  stateAllowed: boolean;
  purchaseLimitReached?: boolean;
  activeAlerts: ComplianceAlert[];
  activeRecalls: RecallNotice[];
}

const ACKNOWLEDGED_RECALLS_KEY = '@nimbus:acknowledged_recalls';

/**
 * Hook to fetch current compliance status
 */
export function useComplianceStatus() {
  return useQuery<ComplianceStatus, Error>({
    queryKey: ['compliance', 'status'],
    queryFn: async () => {
      try {
        return await clientGet<ComplianceStatus>(phase4Client, '/compliance/status');
      } catch {
        // Return default status if endpoint not available
        return {
          ageVerified: false,
          stateAllowed: true,
          activeAlerts: [],
          activeRecalls: [],
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch active product recalls
 */
export function useRecallNotices() {
  return useQuery<RecallNotice[], Error>({
    queryKey: ['compliance', 'recalls'],
    queryFn: async () => {
      try {
        const recalls = await clientGet<RecallNotice[]>(phase4Client, '/compliance/recalls');
        
        // Check which recalls have been acknowledged
        const acknowledgedJson = await AsyncStorage.getItem(ACKNOWLEDGED_RECALLS_KEY);
        const acknowledged = acknowledgedJson ? JSON.parse(acknowledgedJson) : [];
        
        return recalls.map(recall => ({
          ...recall,
          acknowledged: acknowledged.includes(recall.id),
        }));
      } catch {
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to acknowledge a recall notice
 */
export function useAcknowledgeRecall() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (recallId: string) => {
      // Store acknowledgment locally
      const acknowledgedJson = await AsyncStorage.getItem(ACKNOWLEDGED_RECALLS_KEY);
      const acknowledged = acknowledgedJson ? JSON.parse(acknowledgedJson) : [];
      if (!acknowledged.includes(recallId)) {
        acknowledged.push(recallId);
        await AsyncStorage.setItem(ACKNOWLEDGED_RECALLS_KEY, JSON.stringify(acknowledged));
      }
      
      // Optionally notify backend
      try {
        await clientPost<object, void>(phase4Client, `/compliance/recalls/${recallId}/acknowledge`, {});
      } catch {
        // Silently fail - local acknowledgment is sufficient
      }
      
      logEvent('recall_acknowledged', { recallId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'recalls'] });
    },
  });
}

/**
 * Hook to check if a specific product has been recalled
 */
export function useProductRecallStatus(productId: string) {
  const { data: recalls = [] } = useRecallNotices();
  
  const recall = recalls.find((r: RecallNotice) => r.productId === productId);
  
  return {
    isRecalled: !!recall,
    recall,
    severity: recall?.severity,
  };
}

/**
 * Hook to verify age for compliance
 */
export function useAgeVerification() {
  const queryClient = useQueryClient();
  
  return useMutation<{ verified: boolean; expiresAt?: string }, Error, { birthDate: string }>({
    mutationFn: async ({ birthDate }: { birthDate: string }) => {
      const result = await clientPost<{ birthDate: string }, { verified: boolean; expiresAt?: string }>(
        phase4Client,
        '/compliance/verify-age',
        { birthDate }
      );
      logEvent('age_verification_attempt', { verified: result.verified });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] });
    },
  });
}

/**
 * Hook to fetch state restrictions
 */
export function useStateRestrictions(state?: string) {
  return useQuery<{
    allowed: boolean;
    restrictions?: string[];
    legalAge: number;
    medicalOnly?: boolean;
    purchaseLimits?: {
      daily?: number;
      monthly?: number;
    };
  }, Error>({
    queryKey: ['compliance', 'state', state],
    queryFn: async () => {
      if (!state) {
        return { allowed: true, legalAge: 21 };
      }
      try {
        return await clientGet(phase4Client, `/compliance/states/${state}`);
      } catch {
        return { allowed: true, legalAge: 21 };
      }
    },
    enabled: !!state,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// ============================================
// Enhanced Recall Management
// ============================================

export interface UserRecallAlert {
  id: string;
  recallId: string;
  recall: RecallNotice;
  userId: string;
  affectedPurchases: {
    orderId: string;
    orderDate: string;
    productId: string;
    productName: string;
    quantity: number;
    batchNumber?: string;
  }[];
  acknowledgedAt?: string;
  actionTaken?: 'returned' | 'disposed' | 'ignored';
  createdAt: string;
}

export interface ProductComplianceStatus {
  productId: string;
  isRecalled: boolean;
  recallId?: string;
  isBlocked: boolean;
  blockReason?: string;
  requiresMedicalCard: boolean;
  ageRequirement: number;
  labTestingVerified: boolean;
  labTestDate?: string;
  thcContent?: number;
  cbdContent?: number;
  warnings: string[];
}

/**
 * Hook to fetch user's recall alerts (recalls affecting their purchases)
 */
export function useUserRecallAlerts() {
  return useQuery<UserRecallAlert[], Error>({
    queryKey: ['compliance', 'user-recalls'],
    queryFn: async () => {
      try {
        const res = await clientGet<{ alerts: UserRecallAlert[] }>(
          phase4Client,
          '/compliance/user/recalls'
        );
        return res.alerts;
      } catch {
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
}

/**
 * Hook to check if any cart items are affected by recalls
 */
export function useCartRecallCheck(productIds: string[]) {
  return useQuery<{
    hasRecalledItems: boolean;
    recalledProducts: { productId: string; recallId: string; severity: string }[];
  }, Error>({
    queryKey: ['compliance', 'cart-recall-check', productIds],
    queryFn: async () => {
      try {
        const res = await clientPost<{ productIds: string[] }, {
          hasRecalledItems: boolean;
          recalledProducts: { productId: string; recallId: string; severity: string }[];
        }>(
          phase4Client,
          '/compliance/cart/recall-check',
          { productIds }
        );
        return res;
      } catch {
        return { hasRecalledItems: false, recalledProducts: [] };
      }
    },
    enabled: productIds.length > 0,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to check purchase eligibility
 */
export function usePurchaseEligibility(items: { productId: string; quantity: number }[]) {
  return useQuery<{
    eligible: boolean;
    issues: {
      type: 'recall' | 'limit_exceeded' | 'verification_required' | 'medical_card_required' | 'blocked';
      productId?: string;
      message: string;
    }[];
  }, Error>({
    queryKey: ['compliance', 'purchase-eligibility', items],
    queryFn: async () => {
      try {
        return await clientPost<{ items: typeof items }, {
          eligible: boolean;
          issues: {
            type: string;
            productId?: string;
            message: string;
          }[];
        }>(
          phase4Client,
          '/compliance/purchase/eligibility',
          { items }
        );
      } catch {
        return { eligible: true, issues: [] };
      }
    },
    enabled: items.length > 0,
  });
}

/**
 * Hook to fetch product compliance status
 */
export function useProductCompliance(productId: string) {
  return useQuery<ProductComplianceStatus, Error>({
    queryKey: ['compliance', 'product', productId],
    queryFn: async () => {
      try {
        return await clientGet<ProductComplianceStatus>(
          phase4Client,
          `/compliance/products/${productId}`
        );
      } catch {
        return {
          productId,
          isRecalled: false,
          isBlocked: false,
          requiresMedicalCard: false,
          ageRequirement: 21,
          labTestingVerified: true,
          warnings: [],
        };
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to verify medical card
 */
export function useVerifyMedicalCard() {
  const queryClient = useQueryClient();
  
  return useMutation<{ verified: boolean; expiryDate?: string }, Error, {
    cardNumber: string;
    state: string;
    expiryDate: string;
    imageData?: string;
  }>({
    mutationFn: async (cardData: {
      cardNumber: string;
      state: string;
      expiryDate: string;
      imageData?: string;
    }) => {
      const result = await clientPost<typeof cardData, { verified: boolean; expiryDate?: string }>(
        phase4Client,
        '/compliance/verify/medical-card',
        cardData
      );
      logEvent('medical_card_verification', { success: result.verified });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] });
    },
  });
}

/**
 * Hook to fetch state regulations
 */
export function useStateRegulations(state: string) {
  return useQuery<{
    state: string;
    legalStatus: 'recreational' | 'medical_only' | 'decriminalized' | 'illegal';
    purchaseLimits: { category: string; dailyLimit: string; possessionLimit: string }[];
    requiresId: boolean;
    requiresMedicalCard: boolean;
    minimumAge: number;
    taxRates: { type: string; rate: number }[];
    operatingHours: { open: string; close: string };
    deliveryAllowed: boolean;
    consumptionRestrictions: string[];
    lastUpdated: string;
  }, Error>({
    queryKey: ['compliance', 'regulations', state],
    queryFn: async () => {
      return await clientGet<{
        state: string;
        legalStatus: 'recreational' | 'medical_only' | 'decriminalized' | 'illegal';
        purchaseLimits: { category: string; dailyLimit: string; possessionLimit: string }[];
        requiresId: boolean;
        requiresMedicalCard: boolean;
        minimumAge: number;
        taxRates: { type: string; rate: number }[];
        operatingHours: { open: string; close: string };
        deliveryAllowed: boolean;
        consumptionRestrictions: string[];
        lastUpdated: string;
      }>(phase4Client, `/compliance/regulations/${state}`);
    },
    enabled: !!state,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
