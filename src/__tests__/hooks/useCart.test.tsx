/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies before imports
jest.mock('../../api/http', () => ({
  clientGet: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  clientPost: jest.fn().mockResolvedValue({ items: [], total: 0 }),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

const mockQueueAction = jest.fn();
jest.mock('../../hooks/useOfflineCartQueue', () => ({
  useOfflineCartQueue: () => ({
    queueAction: mockQueueAction,
    pending: [],
  }),
}));

const mockStoreItems = [
  { id: '1', name: 'Product 1', price: 10, quantity: 2 },
  { id: '2', name: 'Product 2', price: 20, quantity: 1 },
];

jest.mock('../../../stores/useCartStore', () => ({
  useCartStore: (selector: any) =>
    selector({
      items: mockStoreItems,
      appliedCoupon: 'SAVE10',
      setItems: jest.fn(),
      setAppliedCoupon: jest.fn(),
    }),
}));

import { useCart } from '../../hooks/useCart';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cart object with items from store', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.cart).toBeDefined();
    expect(result.current.cart.items).toEqual(mockStoreItems);
  });

  it('calculates total correctly from store items', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    // Total = (10 * 2) + (20 * 1) = 40
    expect(result.current.cart.total).toBe(40);
  });

  it('includes appliedCoupon from store', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.cart.appliedCoupon).toBe('SAVE10');
  });

  it('has addItem function', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.addItem).toBeDefined();
    expect(typeof result.current.addItem).toBe('function');
  });

  it('has updateCart function', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.updateCart).toBeDefined();
    expect(typeof result.current.updateCart).toBe('function');
  });

  it('has addItems function', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.addItems).toBeDefined();
    expect(typeof result.current.addItems).toBe('function');
  });

  it('has applyPromo function', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.applyPromo).toBeDefined();
    expect(typeof result.current.applyPromo).toBe('function');
  });

  it('has refetchCart function', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.refetchCart).toBeDefined();
    expect(typeof result.current.refetchCart).toBe('function');
  });

  it('exposes loading state', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.isFetching).toBe('boolean');
  });

  it('exposes hasPending for offline queue', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasPending).toBeDefined();
  });
});
