import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mocks
const storage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => storage[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    storage[k] = v;
  }),
  removeItem: jest.fn(async (k: string) => {
    delete storage[k];
  }),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({ isConnected: true })),
  addEventListener: jest.fn(() => () => {}),
}));

const mockPost = jest.fn(async (_endpoint: string, payload: any) => {
  // Echo back a cart response similar to backend shape
  if (payload.items) {
    return {
      data: {
        cart: {
          items: payload.items.map((i: any) => ({ ...i, productId: i.productId })),
          total: 0,
        },
      },
    };
  }
  if (payload.promo) {
    return {
      data: {
        cart: {
          items: [{ productId: 'p1', quantity: 2, price: 10 }],
          total: 20,
          promo: payload.promo,
        },
      },
    };
  }
  return { data: { cart: { items: [], total: 0 } } };
});
jest.mock('../../api/phase4Client', () => ({
  phase4Client: {
    post: (endpoint: string, payload: any) => mockPost(endpoint, payload),
    get: jest.fn(async () => ({ data: { cart: { items: [], total: 0 } } })),
  },
}));

import { useCart } from '../../hooks/useCart';

function Harness({ onReady }: { onReady: (api: any) => void }) {
  const cartApi = useCart();
  React.useEffect(() => {
    onReady(cartApi);
  }, [cartApi, onReady]);
  return null;
}

describe('useCart optimistic merge', () => {
  it('merges item quantities then preserves promo without stripping items', async () => {
    const qc = new QueryClient();
    let api: any;
    render(
      <QueryClientProvider client={qc}>
        <Harness
          onReady={a => {
            api = a;
          }}
        />
      </QueryClientProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Add same item twice to trigger optimistic quantity increment path
    await act(async () => {
      await api.addItem({ productId: 'p1', quantity: 1, price: 10 });
    });
    await act(async () => {
      await api.addItem({ productId: 'p1', quantity: 1, price: 10 });
    });

    // Apply promo to cover promo branch in onMutate
    await act(async () => {
      await api.applyPromo('SAVE20');
    });

    await waitFor(() => {
      const items = api.cart?.items;
      expect(items?.[0]?.quantity).toBe(2); // merged
      expect((api.cart as any)?.promo).toBe('SAVE20');
    });

    expect(mockPost).toHaveBeenCalled();
  });
});
