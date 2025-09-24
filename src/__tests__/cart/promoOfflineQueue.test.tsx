import { act, render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Isolated in its own file to avoid interference with other cart tests
jest.useRealTimers();
jest.setTimeout(10000);

// Simple in-memory async storage mock (scoped per test file)
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

// Always offline for this test so the mutation queues
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({ isConnected: false })),
  addEventListener: jest.fn(() => () => {}),
}));

// Capture post requests (should NOT be called while offline)
const mockPost = jest.fn();
jest.mock('../../api/phase4Client', () => ({
  phase4Client: { post: (...args: any[]) => mockPost(...args) },
}));

// Need the queue hook to observe what got stored
import { useOfflineCartQueue } from '../../hooks/useOfflineCartQueue';
import { useCart } from '../../hooks/useCart';

function Wrapper({ onReady }: { onReady: (api: any) => void }) {
  const cart = useCart();
  const queue = useOfflineCartQueue();
  React.useEffect(() => {
    onReady({ cart, queue });
  }, [cart, queue, onReady]);
  return null;
}

describe('promo code offline queue', () => {
  beforeEach(() => {
    for (const k of Object.keys(storage)) delete storage[k];
    mockPost.mockClear();
    (require('@react-native-async-storage/async-storage').getItem as jest.Mock).mockClear();
    (require('@react-native-async-storage/async-storage').setItem as jest.Mock).mockClear();
  });

  it('queues full promo payload unchanged when offline', async () => {
    let apis: any = null;
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <Wrapper
          onReady={a => {
            apis = a;
          }}
        />
      </QueryClientProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(apis).not.toBeNull();

    // Attempt applying a promo while offline
    const promoCode = 'SAVE20';
    await act(async () => {
      try {
        await apis.cart.applyPromo(promoCode);
      } catch (_e) {
        // The hook throws 'queued' to signal offline queue – swallow it
      }
    });

    // API should not have been called directly while offline
    expect(mockPost).not.toHaveBeenCalled();

    // Inspect queued payload stored in AsyncStorage
    const queueRaw = await (
      require('@react-native-async-storage/async-storage').getItem as jest.Mock
    )('cartQueue');
    expect(queueRaw).toBeTruthy();
    const parsed = JSON.parse(queueRaw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].endpoint).toBe('/cart/apply-coupon');
    // Critical assertion: code object preserved exactly
    expect(parsed[0].payload).toEqual({ code: promoCode });
  });
});
