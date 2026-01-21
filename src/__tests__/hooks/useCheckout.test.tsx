import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  usePaymentMethods,
  useAddPaymentMethod,
  useDeletePaymentMethod,
  useShippingOptions,
  useCreateCheckoutSession,
  useApplyCoupon,
  useRemoveCoupon,
  usePlaceOrder,
  useValidateCheckout,
  useCheckoutFlow,
} from '../../hooks/useCheckout';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const mockSetAppliedCoupon = jest.fn();
const mockClearCart = jest.fn();

jest.mock('../../../stores/useCartStore', () => ({
  useCartStore: (
    selector: (state: { setAppliedCoupon: jest.Mock; clearCart: jest.Mock }) => unknown
  ) => selector({ setAppliedCoupon: mockSetAppliedCoupon, clearCart: mockClearCart }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePaymentMethods hook', () => {
  const mockPaymentMethods = [
    { id: 'pm-1', type: 'card', last4: '4242', brand: 'visa', isDefault: true },
    { id: 'pm-2', type: 'card', last4: '1234', brand: 'mastercard' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch payment methods', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({
      paymentMethods: mockPaymentMethods,
    });

    const { result } = renderHook(() => usePaymentMethods(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPaymentMethods);
  });

  it('should handle array response', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockPaymentMethods);

    const { result } = renderHook(() => usePaymentMethods(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPaymentMethods);
  });
});

describe('useAddPaymentMethod hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a payment method', async () => {
    const newPaymentMethod = { id: 'pm-new', type: 'card', last4: '9999' };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(newPaymentMethod);

    const { result } = renderHook(() => useAddPaymentMethod(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        stripePaymentMethodId: 'stripe_pm_123',
        setAsDefault: true,
      });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/payment-methods', {
      stripePaymentMethodId: 'stripe_pm_123',
      setAsDefault: true,
    });
    expect(logEvent).toHaveBeenCalledWith('payment_method_added', { type: 'card' });
  });
});

describe('useDeletePaymentMethod hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a payment method', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeletePaymentMethod(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('pm-123');
    });

    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/payment-methods/pm-123/delete',
      {}
    );
    expect(logEvent).toHaveBeenCalledWith('payment_method_deleted', { paymentMethodId: 'pm-123' });
  });
});

describe('useShippingOptions hook', () => {
  const mockShippingOptions = [
    { id: 'ship-1', name: 'Standard', price: 5.99, estimatedDays: 5 },
    { id: 'ship-2', name: 'Express', price: 12.99, estimatedDays: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch shipping options with addressId', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ options: mockShippingOptions });

    const { result } = renderHook(() => useShippingOptions('addr-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockShippingOptions);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/checkout/shipping-options?addressId=addr-123'
    );
  });

  it('should not fetch when addressId is not provided', () => {
    const { result } = renderHook(() => useShippingOptions(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateCheckoutSession hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a checkout session', async () => {
    const mockSession = {
      id: 'session-1',
      cartId: 'cart-123',
      subtotal: 100,
      tax: 8,
      shipping: 5,
      discount: 10,
      total: 103,
      currency: 'USD',
    };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockSession);

    const { result } = renderHook(() => useCreateCheckoutSession(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ cartId: 'cart-123', couponCode: 'SAVE10' });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/checkout/session', {
      cartId: 'cart-123',
      couponCode: 'SAVE10',
    });
    expect(logEvent).toHaveBeenCalledWith('checkout_started', {
      subtotal: 100,
      hasDiscount: true,
    });
  });
});

describe('useApplyCoupon hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply a valid coupon', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      discount: 10,
      description: '10% off',
      valid: true,
    });

    const { result } = renderHook(() => useApplyCoupon(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('SAVE10');
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/checkout/apply-coupon', {
      code: 'SAVE10',
    });
    expect(logEvent).toHaveBeenCalledWith('coupon_applied', { code: 'SAVE10', discount: 10 });
  });

  it('should throw error for invalid coupon', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      discount: 0,
      description: '',
      valid: false,
    });

    const { result } = renderHook(() => useApplyCoupon(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('INVALID');
      })
    ).rejects.toThrow('Invalid coupon code');
  });
});

describe('useRemoveCoupon hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove coupon', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRemoveCoupon(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/checkout/remove-coupon', {});
    expect(logEvent).toHaveBeenCalledWith('coupon_removed', {});
  });
});

describe('usePlaceOrder hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should place an order', async () => {
    const mockConfirmation = {
      orderId: 'order-123',
      orderNumber: 'ORD-2024-001',
      estimatedDelivery: '2024-01-15',
    };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockConfirmation);

    const { result } = renderHook(() => usePlaceOrder(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        paymentMethodId: 'pm-123',
        shippingAddressId: 'addr-456',
        tipAmount: 5,
      });
    });

    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/checkout/place-order',
      expect.objectContaining({
        paymentMethodId: 'pm-123',
        shippingAddressId: 'addr-456',
        tipAmount: 5,
      })
    );
    expect(logEvent).toHaveBeenCalledWith('purchase', {
      orderId: 'order-123',
      orderNumber: 'ORD-2024-001',
    });
  });
});

describe('useValidateCheckout hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate checkout', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      valid: true,
      errors: [],
    });

    const { result } = renderHook(() => useValidateCheckout(), {
      wrapper: createWrapper(),
    });

    let validationResult: any;
    await act(async () => {
      validationResult = await result.current.mutateAsync();
    });

    expect(validationResult).toEqual({ valid: true, errors: [] });
    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/checkout/validate', {});
  });

  it('should return validation errors', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      valid: false,
      errors: ['Item out of stock'],
      unavailableItems: ['product-123'],
    });

    const { result } = renderHook(() => useValidateCheckout(), {
      wrapper: createWrapper(),
    });

    let validationResult: any;
    await act(async () => {
      validationResult = await result.current.mutateAsync();
    });

    expect(validationResult.valid).toBe(false);
    expect(validationResult.errors).toContain('Item out of stock');
  });
});

describe('useCheckoutFlow hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (http.clientGet as jest.Mock).mockResolvedValue({ paymentMethods: [], options: [] });
  });

  it('should initialize with address step', () => {
    const { result } = renderHook(() => useCheckoutFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.step).toBe('address');
  });

  it('should navigate to next step', async () => {
    const { result } = renderHook(() => useCheckoutFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToNextStep();
    });

    expect(result.current.step).toBe('shipping');
  });

  it('should navigate to previous step', async () => {
    const { result } = renderHook(() => useCheckoutFlow(), {
      wrapper: createWrapper(),
    });

    // Go to shipping first
    act(() => {
      result.current.goToNextStep();
    });

    expect(result.current.step).toBe('shipping');

    act(() => {
      result.current.goToPreviousStep();
    });

    expect(result.current.step).toBe('address');
  });

  it('should set selected address', async () => {
    const { result } = renderHook(() => useCheckoutFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedAddressId('addr-123');
    });

    expect(result.current.selectedAddressId).toBe('addr-123');
  });
});
