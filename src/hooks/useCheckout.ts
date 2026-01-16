// src/hooks/useCheckout.ts
// Hooks for checkout flow: payment methods, order placement, Stripe integration
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { useCartStore } from '../../stores/useCartStore';
import { logEvent } from '../utils/analytics';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  carrier?: string;
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  stripeClientSecret?: string;
  expiresAt: string;
}

export interface PlaceOrderPayload {
  paymentMethodId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  shippingOptionId?: string;
  tipAmount?: number;
  notes?: string;
  scheduledDelivery?: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  receiptUrl?: string;
}

/**
 * Hook to fetch saved payment methods
 */
export function usePaymentMethods() {
  return useQuery<PaymentMethod[], Error>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const data = await clientGet<{ paymentMethods: PaymentMethod[] } | PaymentMethod[]>(
        phase4Client,
        '/payment-methods'
      );
      return Array.isArray(data) ? data : data.paymentMethods || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    { stripePaymentMethodId: string; setAsDefault?: boolean }
  >({
    mutationFn: async (payload: { stripePaymentMethodId: string; setAsDefault?: boolean }) => {
      const result = await clientPost<typeof payload, PaymentMethod>(
        phase4Client,
        '/payment-methods',
        payload
      );
      logEvent('payment_method_added', { type: result.type });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

/**
 * Hook to delete a payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (paymentMethodId: string) => {
      await clientPost<object, void>(
        phase4Client,
        `/payment-methods/${paymentMethodId}/delete`,
        {}
      );
      logEvent('payment_method_deleted', { paymentMethodId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

/**
 * Hook to fetch available shipping options
 */
export function useShippingOptions(addressId?: string) {
  return useQuery<ShippingOption[], Error>({
    queryKey: ['shippingOptions', addressId],
    queryFn: async () => {
      const params = addressId ? `?addressId=${addressId}` : '';
      const data = await clientGet<{ options: ShippingOption[] } | ShippingOption[]>(
        phase4Client,
        `/checkout/shipping-options${params}`
      );
      return Array.isArray(data) ? data : data.options || [];
    },
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation<CheckoutSession, Error, { cartId?: string; couponCode?: string }>({
    mutationFn: async (payload: { cartId?: string; couponCode?: string }) => {
      const session = await clientPost<typeof payload, CheckoutSession>(
        phase4Client,
        '/checkout/session',
        payload
      );
      logEvent('checkout_started', {
        subtotal: session.subtotal,
        hasDiscount: session.discount > 0,
      });
      return session;
    },
  });
}

/**
 * Hook to apply a coupon/promo code
 */
export function useApplyCoupon() {
  const queryClient = useQueryClient();
  const setAppliedCoupon = useCartStore((state: any) => state.setAppliedCoupon);

  return useMutation<{ discount: number; description: string }, Error, string>({
    mutationFn: async (couponCode: string) => {
      const result = await clientPost<
        { code: string },
        { discount: number; description: string; valid: boolean }
      >(phase4Client, '/checkout/apply-coupon', { code: couponCode });
      if (!result.valid) {
        throw new Error('Invalid coupon code');
      }
      logEvent('coupon_applied', { code: couponCode, discount: result.discount });
      return result;
    },
    onSuccess: (_data: { discount: number; description: string }, couponCode: string) => {
      setAppliedCoupon(couponCode);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to remove applied coupon
 */
export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  const setAppliedCoupon = useCartStore((state: any) => state.setAppliedCoupon);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await clientPost<object, void>(phase4Client, '/checkout/remove-coupon', {});
      logEvent('coupon_removed', {});
    },
    onSuccess: () => {
      setAppliedCoupon(null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to place an order
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state: any) => state.clearCart);

  return useMutation<OrderConfirmation, Error, PlaceOrderPayload>({
    mutationFn: async (payload: PlaceOrderPayload) => {
      const confirmation = await clientPost<PlaceOrderPayload, OrderConfirmation>(
        phase4Client,
        '/checkout/place-order',
        payload
      );
      logEvent('purchase', {
        orderId: confirmation.orderId,
        orderNumber: confirmation.orderNumber,
      });
      return confirmation;
    },
    onSuccess: () => {
      // Clear cart and invalidate queries after successful order
      clearCart?.();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook to validate cart before checkout
 */
export function useValidateCheckout() {
  return useMutation<
    {
      valid: boolean;
      errors?: string[];
      unavailableItems?: string[];
      priceChanges?: Array<{ productId: string; oldPrice: number; newPrice: number }>;
    },
    Error,
    void
  >({
    mutationFn: async () => {
      return await clientPost(phase4Client, '/checkout/validate', {});
    },
  });
}

/**
 * Combined checkout state hook
 */
export function useCheckoutFlow() {
  const [step, setStep] = useState<
    'address' | 'shipping' | 'payment' | 'review' | 'processing' | 'complete'
  >('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

  const { data: paymentMethods } = usePaymentMethods();
  const { data: shippingOptions } = useShippingOptions(selectedAddressId || undefined);
  const placeOrder = usePlaceOrder();

  const goToNextStep = useCallback(() => {
    const steps = ['address', 'shipping', 'payment', 'review', 'processing', 'complete'] as const;
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const goToPreviousStep = useCallback(() => {
    const steps = ['address', 'shipping', 'payment', 'review', 'processing', 'complete'] as const;
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }, [step]);

  const submitOrder = useCallback(
    async (notes?: string, tipAmount?: number) => {
      if (!selectedAddressId || !selectedPaymentMethodId) {
        throw new Error('Missing required checkout information');
      }

      setStep('processing');

      try {
        const confirmation = await placeOrder.mutateAsync({
          paymentMethodId: selectedPaymentMethodId,
          shippingAddressId: selectedAddressId,
          shippingOptionId: selectedShippingOptionId || undefined,
          notes,
          tipAmount,
        });
        setStep('complete');
        return confirmation;
      } catch (error) {
        setStep('review');
        throw error;
      }
    },
    [selectedAddressId, selectedPaymentMethodId, selectedShippingOptionId, placeOrder]
  );

  return {
    step,
    setStep,
    selectedAddressId,
    setSelectedAddressId,
    selectedShippingOptionId,
    setSelectedShippingOptionId,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
    paymentMethods,
    shippingOptions,
    goToNextStep,
    goToPreviousStep,
    submitOrder,
    isProcessing: placeOrder.isPending,
    orderError: placeOrder.error,
  };
}
