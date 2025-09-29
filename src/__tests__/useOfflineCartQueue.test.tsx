import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Use real timers by default to avoid react-test-renderer issues
jest.useRealTimers();
jest.setTimeout(15000);

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

let netListener: ((_state: any) => void) | null = null;
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({ isConnected: false })),
  addEventListener: jest.fn((cb: any) => {
    netListener = cb;
    return () => {};
  }),
}));

const mockPost = jest.fn(async (__endpoint: string, __payload: any) => ({ data: {} }));
jest.mock('../../src/api/phase4Client', () => ({
  phase4Client: { post: (endpoint: string, payload: any) => mockPost(endpoint, payload) },
}));

// Import hook after mocks
import { useOfflineCartQueue } from '../hooks/useOfflineCartQueue';

function HookWrapper({ onReady }: { onReady?: (_q: any) => void }) {
  const _q = useOfflineCartQueue();
  React.useEffect(() => {
    if (onReady) onReady(_q);
  }, [onReady, _q]);
  return null;
}

describe('useOfflineCartQueue', () => {
  beforeEach(() => {
    // clear storage and mocks
    for (const k of Object.keys(storage)) delete storage[k];
    mockPost.mockClear();
    (require('@react-native-async-storage/async-storage').getItem as jest.Mock).mockClear();
    (require('@react-native-async-storage/async-storage').setItem as jest.Mock).mockClear();
    (require('@react-native-async-storage/async-storage').removeItem as jest.Mock).mockClear();
    (require('@react-native-community/netinfo').fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
    });
    netListener = null;
  });

  it('queues actions offline and replays when back online', async () => {
    let actionRef: any = null;
    const onReady = (_q: any) => {
      actionRef = _q;
    };

    // render the hook wrapper; let effects run
    const __rendered = render(<HookWrapper onReady={onReady} />);
    // allow microtasks to settle
    await act(async () => {
      await Promise.resolve();
    });
    expect(actionRef).not.toBeNull();

    // Queue an action while offline with realistic item (productId, quantity, price, variantId)
    const queuedPayload = {
      items: [{ productId: 'prod-1', quantity: 2, price: 19.99, variantId: 'v-1' }],
    };
    // Queue an action while offline
    await act(async () => {
      await actionRef.queueAction({ endpoint: '/cart/update', payload: queuedPayload });
    });

    // queued into AsyncStorage
    expect(require('@react-native-async-storage/async-storage').setItem).toHaveBeenCalled();

    // Now simulate going online by invoking the stored NetInfo listener
    await act(async () => {
      // change fetch to return connected
      (require('@react-native-community/netinfo').fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      if (netListener) netListener({ isConnected: true });
      // give promises a couple of ticks so the async queue can flush
      await Promise.resolve();
      await Promise.resolve();
    });

    // phase4Client.post should have been called with queued action and same payload shape
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith('/cart/update', queuedPayload));

    // AsyncStorage.removeItem should have been called to clear queue
    await waitFor(() =>
      expect(require('@react-native-async-storage/async-storage').removeItem).toHaveBeenCalledWith(
        'cartQueue'
      )
    );
  });
});

// Restore timers after tests to avoid affecting other test files
// No global afterAll needed since we restore timers inline
