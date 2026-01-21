import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCreateOrder, useOrder } from '../../hooks/useOrders';
import { createOrder, fetchOrders } from '../../clients/orderClient';

jest.mock('../../clients/orderClient', () => ({
  createOrder: jest.fn(),
  fetchOrders: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateOrder hook', () => {
  const mockOrder = {
    id: 'order-123',
    status: 'pending',
    total: 99.99,
    createdAt: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order successfully', async () => {
    (createOrder as jest.Mock).mockResolvedValueOnce(mockOrder);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateOrder({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        items: [{ productId: 'prod-1', quantity: 2 }],
        shippingAddressId: 'addr-1',
      });
    });

    expect(createOrder).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockOrder);
  });

  it('should call onError when order creation fails', async () => {
    const error = new Error('Order failed');
    (createOrder as jest.Mock).mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useCreateOrder({ onError }), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync({
          items: [{ productId: 'prod-1', quantity: 1 }],
          shippingAddressId: 'addr-1',
        });
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});

describe('useOrder hook', () => {
  const mockOrders = [
    { id: 'order-1', status: 'completed', total: 50 },
    { id: 'order-2', status: 'pending', total: 75 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a specific order by ID', async () => {
    (fetchOrders as jest.Mock).mockResolvedValueOnce({ orders: mockOrders });

    const { result } = renderHook(() => useOrder('order-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockOrders[0]);
  });

  it('should return undefined when order not found', async () => {
    (fetchOrders as jest.Mock).mockResolvedValueOnce({ orders: mockOrders });

    const { result } = renderHook(() => useOrder('order-999'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetched).toBe(true));

    // The hook may return undefined for non-existent order
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when orderId is empty', () => {
    const { result } = renderHook(() => useOrder(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchOrders).not.toHaveBeenCalled();
  });

  it('should not fetch when disabled', () => {
    const { result } = renderHook(() => useOrder('order-1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchOrders).not.toHaveBeenCalled();
  });
});
