import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateOrder, useOrder } from '../hooks/useOrders';
import * as orderClient from '../clients/orderClient';

jest.mock('../clients/orderClient', () => ({
  createOrder: jest.fn(),
  fetchOrders: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    const mockOrder = { id: 'order-1', items: [], total: 100 };
    (orderClient.createOrder as jest.Mock).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ items: [], storeId: 'store-1' } as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrder);
  });

  it('should call onSuccess callback', async () => {
    const mockOrder = { id: 'order-2', items: [], total: 200 };
    const onSuccess = jest.fn();
    (orderClient.createOrder as jest.Mock).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useCreateOrder({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ items: [], storeId: 'store-1' } as any);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockOrder);
    });
  });

  it('should call onError callback', async () => {
    const onError = jest.fn();
    const error = new Error('Create order failed');
    (orderClient.createOrder as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateOrder({ onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ items: [], storeId: 'store-1' } as any);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

describe('useOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch an order by id', async () => {
    const mockOrder = { id: 'order-1', items: [], total: 100 };
    (orderClient.fetchOrders as jest.Mock).mockResolvedValue({
      orders: [mockOrder],
      total: 1,
    });

    const { result } = renderHook(() => useOrder('order-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrder);
  });

  it('should not fetch when orderId is empty', () => {
    const { result } = renderHook(() => useOrder(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() => useOrder('order-1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});
